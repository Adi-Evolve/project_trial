import { supabase } from './supabase';
import { emailService, createDonationEmailData, DonationEmailData } from './emailService';
import { web3Service, TransactionReceipt } from './web3';

export interface TransactionData {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string; // in ETH
  gasUsed?: number;
  gasPrice?: string;
  blockNumber?: number;
  blockHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  nonce?: number;
  transactionIndex?: number;
  contractAddress?: string;
  logs?: any;
  errorMessage?: string;
}

export interface DonationData {
  projectId: string;
  donorWalletAddress: string;
  amount: string; // in ETH
  message?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionHash: string;
  donorEmail?: string;
  donorName?: string;
  isAnonymous?: boolean;
}

export interface ProjectData {
  projectId: string;
  title: string;
  description?: string;
  creatorWalletAddress: string;
  targetAmount: string; // in ETH
  raisedAmount: string; // in ETH
  deadline?: Date;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  category?: string;
  imageUrl?: string;
  contractAddress?: string;
  blockchainNetwork: string;
  fundsWithdrawn?: boolean;
  withdrawalTxHash?: string;
}

class TransactionService {
  /**
   * Save transaction data to Supabase
   */
  async saveTransaction(transactionData: TransactionData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('🔗 SAVE TRANSACTION - Starting transaction save...');
      console.log('📝 Transaction data to save:', JSON.stringify(transactionData, null, 2));
      
      const transactionRecord = {
        tx_hash: transactionData.txHash,
        from_address: transactionData.fromAddress,
        to_address: transactionData.toAddress,
        value: parseFloat(transactionData.amount),
        gas_used: transactionData.gasUsed,
        gas_price: transactionData.gasPrice ? parseFloat(transactionData.gasPrice) : null,
        block_number: transactionData.blockNumber,
        block_hash: transactionData.blockHash,
        status: transactionData.status,
        transaction_index: transactionData.transactionIndex,
        contract_address: transactionData.contractAddress,
        logs: transactionData.logs || [],
        confirmed_at: transactionData.status === 'confirmed' ? new Date().toISOString() : null
      };
      
      console.log('📤 Inserting transaction record:', JSON.stringify(transactionRecord, null, 2));
      
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .insert([transactionRecord])
        .select()
        .single();

      console.log('📊 Transaction insert result:', {
        success: !error,
        data: data,
        error: error ? {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        } : null
      });

      if (error) {
        console.error('❌ TRANSACTION SAVE FAILED!');
        console.error('🔍 Error analysis:');
        console.error('   - Code:', error.code);
        console.error('   - Message:', error.message);
        console.error('   - Details:', error.details);
        console.error('   - Hint:', error.hint);
        console.error('   - Full error object:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Transaction saved successfully:', data.id);
      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('❌ TRANSACTION SAVE EXCEPTION:', error);
      console.error('🔍 Exception details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Save donation data to Supabase
   */
  async saveDonation(
    donationData: DonationData, 
    userId?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Get project data first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('project_id', donationData.projectId)
        .single();

      if (projectError || !projectData) {
        return { success: false, error: 'Project not found' };
      }

      // Get transaction data
      const { data: transactionData, error: transactionError } = await supabase
        .from('blockchain_transactions')
        .select('id')
        .eq('tx_hash', donationData.transactionHash)
        .single();

      const { data, error } = await supabase
        .from('donations')
        .insert([{
          project_id: projectData.id,
          donor_id: userId || null,
          donor_wallet_address: donationData.donorWalletAddress,
          amount: parseFloat(donationData.amount),
          message: donationData.message,
          status: donationData.status,
          transaction_id: transactionData?.id || null,
          donor_email: donationData.donorEmail,
          donor_name: donationData.donorName,
          is_anonymous: donationData.isAnonymous || false,
          confirmed_at: donationData.status === 'completed' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to save donation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Failed to save donation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save project data to Supabase
   */
  async saveProject(
    projectData: ProjectData, 
    userId: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_id: projectData.projectId,
          title: projectData.title,
          description: projectData.description,
          creator_id: userId,
          creator_wallet_address: projectData.creatorWalletAddress,
          target_amount: parseFloat(projectData.targetAmount),
          raised_amount: parseFloat(projectData.raisedAmount),
          deadline: projectData.deadline?.toISOString(),
          status: projectData.status,
          category: projectData.category,
          image_url: projectData.imageUrl,
          contract_address: projectData.contractAddress,
          blockchain_network: projectData.blockchainNetwork,
          funds_withdrawn: projectData.fundsWithdrawn || false,
          withdrawal_tx_hash: projectData.withdrawalTxHash
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to save project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Failed to save project:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process a complete donation transaction
   */
  async processDonation(
    donationData: DonationData,
    userId?: string
  ): Promise<{ success: boolean; donationId?: string; emailResults?: any; error?: string }> {
    try {
      // 1. Get transaction receipt from blockchain
      const receipt = await web3Service.getTransactionReceipt(donationData.transactionHash);
      
      if (!receipt) {
        return { success: false, error: 'Transaction receipt not found' };
      }

      // 2. Save transaction data
      const transactionResult = await this.saveTransaction({
        txHash: receipt.transactionHash,
        fromAddress: receipt.from,
        toAddress: receipt.to,
        amount: donationData.amount,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        status: receipt.status ? 'confirmed' : 'failed',
        network: 'sepolia'
      });

      if (!transactionResult.success) {
        return { success: false, error: transactionResult.error };
      }

      // 3. Save donation data
      const donationResult = await this.saveDonation({
        ...donationData,
        status: receipt.status ? 'completed' : 'failed'
      }, userId);

      if (!donationResult.success) {
        return { success: false, error: donationResult.error };
      }

      // 4. Send email notifications if donation was successful
      let emailResults = null;
      if (receipt.status && donationData.donorEmail && donationData.donorName) {
        emailResults = await this.sendDonationEmails(donationData);
      }

      // 5. Update project raised amount
      await this.updateProjectRaisedAmount(donationData.projectId);

      return { 
        success: true, 
        donationId: donationResult.id,
        emailResults
      };
    } catch (error: any) {
      console.error('Failed to process donation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send donation emails to donor and creator
   */
  async sendDonationEmails(donationData: DonationData): Promise<{
    donorEmail: { success: boolean; error?: string };
    creatorEmail: { success: boolean; error?: string };
  }> {
    try {
      // Get project and creator details
      const { data: projectData, error } = await supabase
        .from('projects')
        .select(`
          title,
          creator_id,
          creator_wallet_address,
          auth.users!inner(email, raw_user_meta_data)
        `)
        .eq('project_id', donationData.projectId)
        .single();

      if (error || !projectData) {
        console.error('Failed to get project data for email:', error);
        return {
          donorEmail: { success: false, error: 'Project not found' },
          creatorEmail: { success: false, error: 'Project not found' }
        };
      }

      const creatorData = (projectData as any)?.auth?.users;
      const creatorName = creatorData?.raw_user_meta_data?.name || 'Project Creator';
      const creatorEmail = creatorData?.email || '';

      if (!creatorEmail) {
        console.error('Creator email not found');
        return {
          donorEmail: { success: false, error: 'Creator email not found' },
          creatorEmail: { success: false, error: 'Creator email not found' }
        };
      }

      // Create email data
      const emailData = createDonationEmailData({
        donorName: donationData.donorName || 'Anonymous',
        donorEmail: donationData.donorEmail || '',
        projectTitle: (projectData as any)?.title || 'Unknown Project',
        projectCreator: creatorName,
        creatorEmail: creatorEmail,
        amount: donationData.amount,
        message: donationData.message,
        transactionHash: donationData.transactionHash,
        projectId: donationData.projectId
      });

      // Send emails
      const results = await emailService.sendDonationEmails(emailData);

      // Log email results to Supabase
      await this.logEmailNotifications(donationData, emailData, results);

      return results;
    } catch (error: any) {
      console.error('Failed to send donation emails:', error);
      return {
        donorEmail: { success: false, error: error.message },
        creatorEmail: { success: false, error: error.message }
      };
    }
  }

  /**
   * Log email notifications to Supabase
   */
  async logEmailNotifications(
    donationData: DonationData,
    emailData: DonationEmailData,
    results: {
      donorEmail: { success: boolean; error?: string };
      creatorEmail: { success: boolean; error?: string };
    }
  ): Promise<void> {
    try {
      // Get related IDs
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, creator_id')
        .eq('project_id', donationData.projectId)
        .single();

      const { data: donationRecord } = await supabase
        .from('donations')
        .select('id')
        .eq('donor_wallet_address', donationData.donorWalletAddress)
        .eq('transaction_id', (await supabase
          .from('blockchain_transactions')
          .select('id')
          .eq('tx_hash', donationData.transactionHash)
          .single()
        ).data?.id)
        .single();

      const { data: transactionRecord } = await supabase
        .from('blockchain_transactions')
        .select('id')
        .eq('tx_hash', donationData.transactionHash)
        .single();

      // Log donor email notification
      await supabase.from('email_notifications').insert([{
        recipient_email: emailData.donorEmail,
        recipient_name: emailData.donorName,
        email_type: 'donation_sent',
        subject: `Donation Confirmation - ${emailData.projectTitle}`,
        template_data: emailData,
        status: results.donorEmail.success ? 'sent' : 'failed',
        sent_at: results.donorEmail.success ? new Date().toISOString() : null,
        error_message: results.donorEmail.error,
        project_id: projectData?.id,
        donation_id: donationRecord?.id,
        transaction_id: transactionRecord?.id
      }]);

      // Log creator email notification
      await supabase.from('email_notifications').insert([{
        recipient_email: emailData.creatorEmail,
        recipient_name: emailData.projectCreator,
        email_type: 'donation_received',
        subject: `New Donation Received - ${emailData.projectTitle}`,
        template_data: emailData,
        status: results.creatorEmail.success ? 'sent' : 'failed',
        sent_at: results.creatorEmail.success ? new Date().toISOString() : null,
        error_message: results.creatorEmail.error,
        project_id: projectData?.id,
        donation_id: donationRecord?.id,
        transaction_id: transactionRecord?.id,
        user_id: projectData?.creator_id
      }]);
    } catch (error) {
      console.error('Failed to log email notifications:', error);
    }
  }

  /**
   * Update project raised amount from blockchain
   */
  async updateProjectRaisedAmount(projectId: string): Promise<void> {
    try {
      const blockchainProject = await web3Service.getProject(projectId);
      
      if (blockchainProject) {
        await supabase
          .from('projects')
          .update({
            raised_amount: parseFloat(blockchainProject.raisedAmount),
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId);
      }
    } catch (error) {
      console.error('Failed to update project raised amount:', error);
    }
  }

  /**
   * Get donation history for a project
   */
  async getProjectDonations(projectId: string): Promise<{
    success: boolean;
    donations?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          projects!inner(project_id),
          blockchain_transactions(tx_hash, block_number, confirmed_at)
        `)
        .eq('projects.project_id', projectId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, donations: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user donation history
   */
  async getUserDonations(userId: string): Promise<{
    success: boolean;
    donations?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          projects(project_id, title, creator_wallet_address),
          blockchain_transactions(tx_hash, block_number, confirmed_at)
        `)
        .eq('donor_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, donations: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<{
    success: boolean;
    transaction?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('tx_hash', txHash)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, transaction: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Monitor transaction and update status
   */
  async monitorTransaction(txHash: string): Promise<void> {
    const checkTransaction = async () => {
      try {
        const receipt = await web3Service.getTransactionReceipt(txHash);
        
        if (receipt) {
          // Update transaction status in database
          await supabase
            .from('blockchain_transactions')
            .update({
              status: receipt.status ? 'confirmed' : 'failed',
              block_number: receipt.blockNumber,
              gas_used: receipt.gasUsed,
              confirmed_at: new Date().toISOString()
            })
            .eq('tx_hash', txHash);

          // Update related donation status
          await supabase
            .from('donations')
            .update({
              status: receipt.status ? 'completed' : 'failed',
              confirmed_at: new Date().toISOString()
            })
            .eq('transaction_id', (await supabase
              .from('blockchain_transactions')
              .select('id')
              .eq('tx_hash', txHash)
              .single()
            ).data?.id);

          return; // Transaction confirmed, stop monitoring
        }

        // If transaction not found, try again in 10 seconds
        setTimeout(checkTransaction, 10000);
      } catch (error) {
        console.error('Error monitoring transaction:', error);
        setTimeout(checkTransaction, 10000); // Retry on error
      }
    };

    checkTransaction();
  }
}

// Export singleton instance
export const transactionService = new TransactionService();