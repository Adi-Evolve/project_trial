import { supabase } from './supabase';
import { web3Service } from './web3';
import { errorHandler } from './errorHandler';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetAmount: number; // Percentage of total funds (0-100)
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'released';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  evidence?: string; // Documentation or proof of completion
  reviewerComments?: string;
}

export interface EscrowRelease {
  id: string;
  projectId: string;
  milestoneId: string;
  amount: string; // Amount in ETH
  releaseType: 'milestone' | 'emergency' | 'final';
  status: 'pending' | 'approved' | 'executed' | 'failed';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  transactionHash?: string;
  executedAt?: string;
}

export interface ProjectEscrow {
  projectId: string;
  totalFunds: string; // Total funds in ETH
  releasedFunds: string; // Already released funds
  lockedFunds: string; // Remaining locked funds
  milestoneCount: number;
  completedMilestones: number;
  escrowStatus: 'active' | 'completed' | 'disputed' | 'emergency_release';
}

class EscrowService {
  /**
   * Create milestones for a project
   */
  async createMilestones(
    projectId: string, 
    milestones: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<{ success: boolean; milestones?: Milestone[]; error?: string }> {
    const context = errorHandler.createContext('createMilestones', 'EscrowService', 
      `projectId: ${projectId}, count: ${milestones.length}`);
    
    try {
      // Validate milestone percentages add up to 100%
      const totalPercentage = milestones.reduce((sum, milestone) => sum + milestone.targetAmount, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        const error = {
          code: 'invalid_milestones',
          message: `Milestone percentages must total 100%, got ${totalPercentage}%`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      const milestonesWithId = milestones.map(milestone => ({
        ...milestone,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending' as const
      }));

      const { data, error } = await supabase
        .from('project_milestones')
        .insert(milestonesWithId)
        .select();

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`✅ Created ${data.length} milestones for project ${projectId}`);
      return { success: true, milestones: data };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Get all milestones for a project
   */
  async getProjectMilestones(projectId: string): Promise<{ success: boolean; milestones?: Milestone[]; error?: string }> {
    const context = errorHandler.createContext('getProjectMilestones', 'EscrowService', `projectId: ${projectId}`);
    
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('projectId', projectId)
        .order('createdAt', { ascending: true });

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      return { success: true, milestones: data || [] };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Submit milestone completion for review
   */
  async submitMilestoneCompletion(
    milestoneId: string,
    evidence: string
  ): Promise<{ success: boolean; error?: string }> {
    const context = errorHandler.createContext('submitMilestoneCompletion', 'EscrowService', 
      `milestoneId: ${milestoneId}`);
    
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          status: 'in_review',
          evidence,
          updatedAt: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`📋 Milestone ${milestoneId} submitted for review`);
      return { success: true };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Approve milestone completion
   */
  async approveMilestone(
    milestoneId: string,
    reviewerComments?: string
  ): Promise<{ success: boolean; error?: string }> {
    const context = errorHandler.createContext('approveMilestone', 'EscrowService', 
      `milestoneId: ${milestoneId}`);
    
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          status: 'approved',
          reviewerComments,
          updatedAt: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`✅ Milestone ${milestoneId} approved`);
      return { success: true };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Request fund release for an approved milestone
   */
  async requestMilestoneRelease(
    projectId: string,
    milestoneId: string,
    requestedBy: string
  ): Promise<{ success: boolean; releaseRequest?: EscrowRelease; error?: string }> {
    const context = errorHandler.createContext('requestMilestoneRelease', 'EscrowService', 
      `projectId: ${projectId}, milestoneId: ${milestoneId}`);
    
    try {
      // Get milestone details
      const { data: milestone, error: milestoneError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      if (milestoneError || !milestone) {
        const error = {
          code: 'milestone_not_found',
          message: 'Milestone not found'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      if (milestone.status !== 'approved') {
        const error = {
          code: 'milestone_not_approved',
          message: 'Milestone must be approved before requesting release'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      // Get project's total funds from blockchain
      const projectData = await web3Service.getProject(projectId);
      if (!projectData) {
        const error = {
          code: 'project_not_found',
          message: 'Project not found on blockchain'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      // Calculate release amount
      const totalFunds = parseFloat(web3Service.convertWeiToEth(projectData.raisedAmount));
      const releaseAmount = (totalFunds * milestone.targetAmount / 100).toString();

      const releaseRequest: Omit<EscrowRelease, 'id'> = {
        projectId,
        milestoneId,
        amount: releaseAmount,
        releaseType: 'milestone',
        status: 'pending',
        requestedBy,
        requestedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('escrow_releases')
        .insert({
          ...releaseRequest,
          id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`💰 Release request created for ${releaseAmount} ETH`);
      return { success: true, releaseRequest: data };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Execute approved fund release
   */
  async executeFundRelease(
    releaseId: string,
    executedBy: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const context = errorHandler.createContext('executeFundRelease', 'EscrowService', 
      `releaseId: ${releaseId}`);
    
    try {
      // Get release request details
      const { data: release, error: releaseError } = await supabase
        .from('escrow_releases')
        .select('*')
        .eq('id', releaseId)
        .single();

      if (releaseError || !release) {
        const error = {
          code: 'release_not_found',
          message: 'Release request not found'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      if (release.status !== 'approved') {
        const error = {
          code: 'release_not_approved',
          message: 'Release request must be approved first'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`🚀 Executing fund release: ${release.amount} ETH for project ${release.projectId}`);

      // Execute blockchain transaction
      const withdrawResult = await web3Service.withdrawFunds(release.projectId);
      
      if (!withdrawResult.success) {
        // Update release status to failed
        await supabase
          .from('escrow_releases')
          .update({
            status: 'failed',
            updatedAt: new Date().toISOString()
          })
          .eq('id', releaseId);

        return { success: false, error: withdrawResult.error };
      }

      // Update release status to executed
      const { error: updateError } = await supabase
        .from('escrow_releases')
        .update({
          status: 'executed',
          transactionHash: withdrawResult.transactionHash,
          executedAt: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (updateError) {
        console.error('Failed to update release status:', updateError);
        // Transaction succeeded but database update failed - log for manual review
      }

      // Update milestone status to released
      await supabase
        .from('project_milestones')
        .update({
          status: 'released',
          updatedAt: new Date().toISOString()
        })
        .eq('id', release.milestoneId);

      console.log(`✅ Fund release executed successfully: ${withdrawResult.transactionHash}`);
      return { 
        success: true, 
        transactionHash: withdrawResult.transactionHash 
      };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Get escrow status for a project
   */
  async getProjectEscrowStatus(projectId: string): Promise<{ success: boolean; escrow?: ProjectEscrow; error?: string }> {
    const context = errorHandler.createContext('getProjectEscrowStatus', 'EscrowService', 
      `projectId: ${projectId}`);
    
    try {
      // Get project data from blockchain
      const projectData = await web3Service.getProject(projectId);
      if (!projectData) {
        const error = {
          code: 'project_not_found',
          message: 'Project not found on blockchain'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      // Get milestones
      const milestonesResult = await this.getProjectMilestones(projectId);
      if (!milestonesResult.success) {
        return { success: false, error: milestonesResult.error };
      }

      const milestones = milestonesResult.milestones || [];
      const completedMilestones = milestones.filter(m => m.status === 'released').length;

      // Get executed releases
      const { data: executedReleases, error: releasesError } = await supabase
        .from('escrow_releases')
        .select('amount')
        .eq('projectId', projectId)
        .eq('status', 'executed');

      if (releasesError) {
        const errorDetails = errorHandler.handleError(releasesError, context);
        return { success: false, error: errorDetails.userMessage };
      }

      const totalFunds = web3Service.convertWeiToEth(projectData.raisedAmount);
      const releasedFunds = (executedReleases || [])
        .reduce((sum, release) => sum + parseFloat(release.amount), 0)
        .toString();
      const lockedFunds = (parseFloat(totalFunds) - parseFloat(releasedFunds)).toString();

      const escrow: ProjectEscrow = {
        projectId,
        totalFunds,
        releasedFunds,
        lockedFunds,
        milestoneCount: milestones.length,
        completedMilestones,
        escrowStatus: completedMilestones === milestones.length ? 'completed' : 'active'
      };

      return { success: true, escrow };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Emergency fund release (for critical situations)
   */
  async requestEmergencyRelease(
    projectId: string,
    reason: string,
    requestedBy: string
  ): Promise<{ success: boolean; releaseRequest?: EscrowRelease; error?: string }> {
    const context = errorHandler.createContext('requestEmergencyRelease', 'EscrowService', 
      `projectId: ${projectId}, reason: ${reason}`);
    
    try {
      const projectData = await web3Service.getProject(projectId);
      if (!projectData) {
        const error = {
          code: 'project_not_found',
          message: 'Project not found on blockchain'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      const totalFunds = web3Service.convertWeiToEth(projectData.raisedAmount);

      const releaseRequest: Omit<EscrowRelease, 'id'> = {
        projectId,
        milestoneId: 'emergency',
        amount: totalFunds,
        releaseType: 'emergency',
        status: 'pending',
        requestedBy,
        requestedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('escrow_releases')
        .insert({
          ...releaseRequest,
          id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) {
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log(`🚨 Emergency release request created for ${totalFunds} ETH`);
      return { success: true, releaseRequest: data };
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }
}

export const escrowService = new EscrowService();