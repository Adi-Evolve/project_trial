import emailjs from '@emailjs/browser';
import { supabase } from './supabase';
import { advancedContractService } from './advancedContracts';
import { ipfsStorageService } from './ipfsStorage';

// EmailJS configuration from BS folder implementation
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_b3nxl5h';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'k7dAyZP8ICb_kFD25';
const EMAILJS_PRIVATE_KEY = process.env.REACT_APP_EMAILJS_PRIVATE_KEY || '7cMzX9dkY_0eeuE-65N3k';

// Template IDs for various email types
const EMAIL_TEMPLATES = {
  DONATION_RECEIVED: process.env.REACT_APP_EMAILJS_TEMPLATE_DONATION_RECEIVED || 'template_l478i9x',
  DONATION_SENT: process.env.REACT_APP_EMAILJS_TEMPLATE_DONATION_SENT || 'template_l478i9x',
  APPROVAL: process.env.REACT_APP_EMAILJS_TEMPLATE_APPROVAL || 'template_l478i9x',
  REJECTION: process.env.REACT_APP_EMAILJS_TEMPLATE_REJECTION || 'template_bgmf5nm',
  VERIFICATION: process.env.REACT_APP_EMAILJS_TEMPLATE_VERIFICATION || 'template_l478i9x',
  PROJECT_SUBMISSION: process.env.REACT_APP_EMAILJS_TEMPLATE_PROJECT_SUBMISSION || 'template_l478i9x',
  IDEA_SUBMITTED: process.env.REACT_APP_EMAILJS_TEMPLATE_IDEA_SUBMITTED || 'template_l478i9x',
  MILESTONE_UPDATE: process.env.REACT_APP_EMAILJS_TEMPLATE_MILESTONE_UPDATE || 'template_l478i9x'
};

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  projectTitle: string;
  projectCreator: string;
  creatorEmail: string;
  donationAmount: string;
  donationMessage?: string;
  transactionHash: string;
  blockExplorerUrl: string;
  projectUrl: string;
  timestamp: string;
}

export interface ProjectEmailData {
  projectTitle: string;
  projectDescription: string;
  creatorName: string;
  creatorEmail: string;
  adminEmail: string;
  projectUrl: string;
  submissionDate: string;
  category: string;
  fundingGoal: string;
}

export interface IdeaEmailData {
  ideaTitle: string;
  ideaDescription: string;
  submitterName: string;
  submitterEmail: string;
  adminEmail: string;
  submissionDate: string;
  category: string;
  estimatedBudget?: string;
}

export interface VerificationEmailData {
  userName: string;
  userEmail: string;
  verificationLink: string;
  verificationToken: string;
  expiresAt: string;
}

export interface EmailTemplate {
  to_name: string;
  to_email: string;
  from_name: string;
  subject: string;
  [key: string]: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
  blockchainHash?: string;
  supabaseId?: string;
  ipfsHash?: string;
}

export interface EmailLogEntry {
  id?: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  template_id: string;
  blockchain_hash?: string;
  ipfs_hash?: string;
  status: 'pending' | 'sent' | 'failed' | 'error';
  error_message?: string;
  created_at?: string;
  metadata?: any;
}

class EmailService {
  private isConfigured: boolean;
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.isConfigured = Boolean(
      EMAILJS_SERVICE_ID && 
      EMAIL_TEMPLATES.APPROVAL && 
      EMAIL_TEMPLATES.REJECTION && 
      EMAILJS_PUBLIC_KEY
    );

    if (!this.isConfigured) {
      console.warn('EmailJS not properly configured. Please check your environment variables.');
    }
  }

  private async saveEmailToBlockchain(emailData: any, type: string): Promise<string | null> {
    try {
      const emailMetadata = {
        type,
        recipient: emailData.to_email,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
        templateId: emailData.template_id,
        hash: this.generateEmailHash(emailData)
      };

      const result = await advancedContractService.storeEmailRecord(emailMetadata);
      console.log('Email metadata stored on blockchain:', result);
      return result.transactionHash || null;
    } catch (error) {
      console.error('Failed to store email on blockchain:', error);
      // In development mode, this is expected - contracts are disabled
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent successfully (blockchain storage skipped in development)');
      }
      return null;
    }
  }

  private async saveEmailLogToSupabase(logEntry: EmailLogEntry): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .insert(logEntry)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase email log error:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Failed to save email log to Supabase:', error);
      return null;
    }
  }

  private generateEmailHash(emailData: any): string {
    const dataString = JSON.stringify({
      to: emailData.to_email,
      subject: emailData.subject,
      timestamp: emailData.timestamp || new Date().toISOString(),
      template: emailData.template_id
    });
    
    // Simple hash generation (in production, use a proper crypto library)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async sendEmailWithRetry(templateData: EmailTemplate, templateId: string): Promise<EmailResult> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Sending email attempt ${attempt}/${this.retryAttempts}`);
        
        const result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          templateId,
          templateData,
          EMAILJS_PUBLIC_KEY
        );

        if (result.status === 200) {
          console.log('Email sent successfully:', result);
          return {
            success: true,
            messageId: result.text
          };
        } else {
          throw new Error(`EmailJS returned status: ${result.status}`);
        }
      } catch (error) {
        console.error(`Email attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: 'Max retry attempts exceeded'
    };
  }

  private async processEmailSend(
    templateData: EmailTemplate, 
    templateId: string, 
    emailType: string
  ): Promise<EmailResult> {
    const logEntry: EmailLogEntry = {
      email_type: emailType,
      recipient_email: templateData.to_email,
      recipient_name: templateData.to_name,
      subject: templateData.subject,
      template_id: templateId,
      status: 'pending',
      created_at: new Date().toISOString(),
      metadata: templateData
    };

    try {
      // Send email
      const emailResult = await this.sendEmailWithRetry(templateData, templateId);
      
      if (emailResult.success) {
        logEntry.status = 'sent';
        
        // Store in blockchain
        const blockchainHash = await this.saveEmailToBlockchain(templateData, emailType);
        if (blockchainHash) {
          logEntry.blockchain_hash = blockchainHash;
          emailResult.blockchainHash = blockchainHash;
        }
        
        // Save to Supabase
        const supabaseId = await this.saveEmailLogToSupabase(logEntry);
        if (supabaseId) {
          emailResult.supabaseId = supabaseId;
        }
        
        return emailResult;
      } else {
        logEntry.status = 'failed';
        logEntry.error_message = emailResult.error;
        await this.saveEmailLogToSupabase(logEntry);
        return emailResult;
      }
    } catch (error) {
      logEntry.status = 'error';
      logEntry.error_message = error instanceof Error ? error.message : 'Unknown error';
      await this.saveEmailLogToSupabase(logEntry);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send donation confirmation email to the donor
   */
  async sendDonationConfirmationToDonor(data: DonationEmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const templateParams: EmailTemplate = {
        to_name: data.donorName,
        to_email: data.donorEmail,
        from_name: 'ProjectForge',
        subject: `Donation Confirmation - ${data.projectTitle}`,
        donor_name: data.donorName,
        project_title: data.projectTitle,
        project_creator: data.projectCreator,
        donation_amount: data.donationAmount,
        donation_message: data.donationMessage || '',
        transaction_hash: data.transactionHash,
        block_explorer_url: data.blockExplorerUrl,
        project_url: data.projectUrl,
        timestamp: data.timestamp,
        email_type: 'donation_sent'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAIL_TEMPLATES.DONATION_SENT,
        templateParams
      );

      console.log('Donation confirmation email sent successfully:', response);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send donation confirmation email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }

  /**
   * Send donation notification email to the project creator
   */
  async sendDonationNotificationToCreator(data: DonationEmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const templateParams: EmailTemplate = {
        to_name: data.projectCreator,
        to_email: data.creatorEmail,
        from_name: 'ProjectForge',
        subject: `New Donation Received - ${data.projectTitle}`,
        creator_name: data.projectCreator,
        donor_name: data.donorName,
        project_title: data.projectTitle,
        donation_amount: data.donationAmount,
        donation_message: data.donationMessage || 'No message provided',
        transaction_hash: data.transactionHash,
        block_explorer_url: data.blockExplorerUrl,
        project_url: data.projectUrl,
        timestamp: data.timestamp,
        email_type: 'donation_received'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAIL_TEMPLATES.DONATION_RECEIVED,
        templateParams
      );

      console.log('Donation notification email sent successfully:', response);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send donation notification email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }

  /**
   * Send both donation emails (to donor and creator)
   */
  async sendDonationEmails(data: DonationEmailData): Promise<{
    donorEmail: { success: boolean; error?: string };
    creatorEmail: { success: boolean; error?: string };
  }> {
    const [donorResult, creatorResult] = await Promise.allSettled([
      this.sendDonationConfirmationToDonor(data),
      this.sendDonationNotificationToCreator(data)
    ]);

    return {
      donorEmail: donorResult.status === 'fulfilled' 
        ? donorResult.value 
        : { success: false, error: 'Promise rejected' },
      creatorEmail: creatorResult.status === 'fulfilled' 
        ? creatorResult.value 
        : { success: false, error: 'Promise rejected' }
    };
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(
    templateId: string,
    templateParams: EmailTemplate
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        templateId,
        templateParams
      );

      console.log('Custom email sent successfully:', response);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send custom email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }

  /**
   * Send project submission notification to admin
   */
  async sendProjectSubmissionEmail(data: ProjectEmailData): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: 'Admin Team',
      to_email: data.adminEmail,
      from_name: 'ProjectForge',
      subject: `New Project Submission: ${data.projectTitle}`,
      project_title: data.projectTitle,
      project_description: data.projectDescription,
      creator_name: data.creatorName,
      creator_email: data.creatorEmail,
      project_url: data.projectUrl,
      submission_date: data.submissionDate,
      category: data.category,
      funding_goal: data.fundingGoal,
      template_id: EMAIL_TEMPLATES.PROJECT_SUBMISSION
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.PROJECT_SUBMISSION, 'project_submission');
  }

  /**
   * Send idea submission notification to admin
   */
  async sendIdeaSubmissionEmail(data: IdeaEmailData): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: 'Admin Team',
      to_email: data.adminEmail,
      from_name: 'ProjectForge',
      subject: `New Idea Submission: ${data.ideaTitle}`,
      idea_title: data.ideaTitle,
      idea_description: data.ideaDescription,
      submitter_name: data.submitterName,
      submitter_email: data.submitterEmail,
      submission_date: data.submissionDate,
      category: data.category,
      estimated_budget: data.estimatedBudget || 'Not specified',
      template_id: EMAIL_TEMPLATES.IDEA_SUBMITTED
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.IDEA_SUBMITTED, 'idea_submission');
  }

  /**
   * Send approval email
   */
  async sendApprovalEmail(
    recipientName: string,
    recipientEmail: string,
    itemTitle: string,
    itemType: 'project' | 'idea',
    additionalData?: any
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: recipientName,
      to_email: recipientEmail,
      from_name: 'ProjectForge',
      subject: `${itemType === 'project' ? 'Project' : 'Idea'} Approved: ${itemTitle}`,
      recipient_name: recipientName,
      item_title: itemTitle,
      item_type: itemType,
      approval_date: new Date().toLocaleDateString(),
      ...additionalData,
      template_id: EMAIL_TEMPLATES.APPROVAL
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.APPROVAL, 'approval');
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(
    recipientName: string,
    recipientEmail: string,
    itemTitle: string,
    itemType: 'project' | 'idea',
    reason?: string,
    additionalData?: any
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: recipientName,
      to_email: recipientEmail,
      from_name: 'ProjectForge',
      subject: `${itemType === 'project' ? 'Project' : 'Idea'} Status Update: ${itemTitle}`,
      recipient_name: recipientName,
      item_title: itemTitle,
      item_type: itemType,
      rejection_reason: reason || 'Please review submission guidelines',
      rejection_date: new Date().toLocaleDateString(),
      ...additionalData,
      template_id: EMAIL_TEMPLATES.REJECTION
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.REJECTION, 'rejection');
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: data.userName,
      to_email: data.userEmail,
      from_name: 'ProjectForge',
      subject: 'Verify Your Email Address',
      user_name: data.userName,
      verification_link: data.verificationLink,
      verification_token: data.verificationToken,
      expires_at: data.expiresAt,
      template_id: EMAIL_TEMPLATES.VERIFICATION
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.VERIFICATION, 'verification');
  }

  /**
   * Send milestone update notification
   */
  async sendMilestoneUpdateEmail(
    projectTitle: string,
    creatorName: string,
    creatorEmail: string,
    milestoneDescription: string,
    updateDetails: string,
    projectUrl: string
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateData: EmailTemplate = {
      to_name: creatorName,
      to_email: creatorEmail,
      from_name: 'ProjectForge',
      subject: `Milestone Update: ${projectTitle}`,
      project_title: projectTitle,
      creator_name: creatorName,
      milestone_description: milestoneDescription,
      update_details: updateDetails,
      project_url: projectUrl,
      update_date: new Date().toLocaleDateString(),
      template_id: EMAIL_TEMPLATES.MILESTONE_UPDATE
    };

    return this.processEmailSend(templateData, EMAIL_TEMPLATES.MILESTONE_UPDATE, 'milestone_update');
  }

  /**
   * Get email logs from Supabase
   */
  async getEmailLogs(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      email_type?: string;
      status?: string;
      recipient_email?: string;
    }
  ): Promise<{ data: EmailLogEntry[]; error?: string }> {
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.email_type) {
        query = query.eq('email_type', filters.email_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.recipient_email) {
        query = query.eq('recipient_email', filters.recipient_email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch email logs:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail: string): Promise<{ success: boolean; error?: string }> {
    const testData: DonationEmailData = {
      donorName: 'Test Donor',
      donorEmail: testEmail,
      projectTitle: 'Test Project',
      projectCreator: 'Test Creator',
      creatorEmail: testEmail,
      donationAmount: '0.1',
      donationMessage: 'This is a test donation',
      transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
      blockExplorerUrl: 'https://sepolia.etherscan.io/tx/0x1234567890abcdef1234567890abcdef12345678',
      projectUrl: 'https://projectforge.com/project/test',
      timestamp: new Date().toLocaleString()
    };

    return await this.sendDonationConfirmationToDonor(testData);
  }

  /**
   * Get email template preview
   */
  getEmailPreview(data: DonationEmailData, type: 'donor' | 'creator'): string {
    if (type === 'donor') {
      return `
        Subject: Donation Confirmation - ${data.projectTitle}
        
        Dear ${data.donorName},
        
        Thank you for your generous donation of ${data.donationAmount} ETH to "${data.projectTitle}" by ${data.projectCreator}!
        
        Transaction Details:
        - Amount: ${data.donationAmount} ETH
        - Transaction Hash: ${data.transactionHash}
        - Timestamp: ${data.timestamp}
        ${data.donationMessage ? `- Your Message: "${data.donationMessage}"` : ''}
        
        You can view your transaction on the blockchain explorer:
        ${data.blockExplorerUrl}
        
        Visit the project page:
        ${data.projectUrl}
        
        Thank you for supporting innovation on ProjectForge!
        
        Best regards,
        The ProjectForge Team
      `;
    } else {
      return `
        Subject: New Donation Received - ${data.projectTitle}
        
        Dear ${data.projectCreator},
        
        Great news! You've received a new donation for your project "${data.projectTitle}".
        
        Donation Details:
        - Donor: ${data.donorName}
        - Amount: ${data.donationAmount} ETH
        - Transaction Hash: ${data.transactionHash}
        - Timestamp: ${data.timestamp}
        ${data.donationMessage ? `- Message from donor: "${data.donationMessage}"` : ''}
        
        View the transaction:
        ${data.blockExplorerUrl}
        
        Manage your project:
        ${data.projectUrl}
        
        Keep up the great work!
        
        Best regards,
        The ProjectForge Team
      `;
    }
  }

  /**
   * Check if EmailJS is properly configured
   */
  isEmailServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    serviceId: boolean;
    donationReceivedTemplate: boolean;
    donationSentTemplate: boolean;
    publicKey: boolean;
    overall: boolean;
  } {
    return {
      serviceId: Boolean(EMAILJS_SERVICE_ID),
      donationReceivedTemplate: Boolean(EMAIL_TEMPLATES.DONATION_RECEIVED),
      donationSentTemplate: Boolean(EMAIL_TEMPLATES.DONATION_SENT),
      publicKey: Boolean(EMAILJS_PUBLIC_KEY),
      overall: this.isConfigured
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Utility functions
export const formatTransactionUrl = (txHash: string, network: string = 'sepolia'): string => {
  const baseUrls: { [key: string]: string } = {
    mainnet: 'https://etherscan.io/tx/',
    sepolia: 'https://sepolia.etherscan.io/tx/',
    goerli: 'https://goerli.etherscan.io/tx/',
  };

  return `${baseUrls[network] || baseUrls.sepolia}${txHash}`;
};

export const formatTimestamp = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export const createDonationEmailData = (
  donation: {
    donorName: string;
    donorEmail: string;
    projectTitle: string;
    projectCreator: string;
    creatorEmail: string;
    amount: string;
    message?: string;
    transactionHash: string;
    projectId: string;
  }
): DonationEmailData => {
  return {
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    projectTitle: donation.projectTitle,
    projectCreator: donation.projectCreator,
    creatorEmail: donation.creatorEmail,
    donationAmount: donation.amount,
    donationMessage: donation.message,
    transactionHash: donation.transactionHash,
    blockExplorerUrl: formatTransactionUrl(donation.transactionHash),
    projectUrl: `${window.location.origin}/project/${donation.projectId}`,
    timestamp: formatTimestamp(new Date())
  };
};

// Types already exported above