import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export interface ContributionData {
  id?: string;
  project_id: string;
  contributor_id: string;
  amount: number;
  currency: string;
  blockchain_tx_hash: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
  transaction_fee?: number;
  status: 'pending' | 'confirmed' | 'failed';
  contribution_message?: string;
  is_anonymous?: boolean;
  reward_tier?: string;
  created_at?: string;
  confirmed_at?: string;
}

export interface ProjectContribution {
  id: string;
  amount: number;
  currency: string;
  contributor_name?: string;
  contribution_message?: string;
  is_anonymous: boolean;
  created_at: string;
  confirmed_at?: string;
  blockchain_tx_hash: string;
}

class ContributionsService {
  /**
   * Save a contribution to Supabase
   */
  async saveContribution(contribution: Omit<ContributionData, 'id' | 'created_at'>): Promise<{
    success: boolean;
    contribution?: ContributionData;
    error?: string;
  }> {
    try {
      console.log('💰 Saving contribution to Supabase:', contribution);

      const { data, error } = await supabase
        .from('contributions')
        .insert([contribution])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to save contribution:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Contribution saved successfully:', data);
      return { success: true, contribution: data };

    } catch (error: any) {
      console.error('❌ Error saving contribution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update contribution status (e.g., when transaction is confirmed)
   */
  async updateContributionStatus(
    txHash: string, 
    status: 'confirmed' | 'failed',
    blockNumber?: number,
    gasUsed?: number
  ): Promise<{
    success: boolean;
    contribution?: ContributionData;
    error?: string;
  }> {
    try {
      const updates: Partial<ContributionData> = {
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : undefined
      };

      if (blockNumber) updates.block_number = blockNumber;
      if (gasUsed) updates.gas_used = gasUsed;

      const { data, error } = await supabase
        .from('contributions')
        .update(updates)
        .eq('blockchain_tx_hash', txHash)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update contribution status:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Contribution status updated:', data);
      return { success: true, contribution: data };

    } catch (error: any) {
      console.error('❌ Error updating contribution status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get contributions for a project
   */
  async getProjectContributions(projectId: string): Promise<{
    success: boolean;
    contributions?: ProjectContribution[];
    totalAmount?: number;
    totalContributors?: number;
    error?: string;
  }> {
    try {
      console.log('📊 Getting contributions for project:', projectId);

      // First, get the project UUID from the projects table using the project identifier
      let { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      // If not found by UUID, try by title or other identifier
      if (projectError || !project) {
        const { data: projectByTitle, error: titleError } = await supabase
          .from('projects')
          .select('id')
          .ilike('title', `%${projectId}%`)
          .limit(1)
          .single();

        if (titleError || !projectByTitle) {
          console.warn('⚠️ Project not found in database:', projectId);
          return { 
            success: true, 
            contributions: [], 
            totalAmount: 0, 
            totalContributors: 0 
          };
        }
        project = projectByTitle;
      }

      const { data: contributions, error } = await supabase
        .from('contributions')
        .select(`
          id,
          amount,
          currency,
          contribution_message,
          is_anonymous,
          created_at,
          confirmed_at,
          blockchain_tx_hash,
          contributor_id,
          status,
          users!inner(email, raw_user_meta_data)
        `)
        .eq('project_id', project.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to get project contributions:', error);
        return { success: false, error: error.message };
      }

      const formattedContributions: ProjectContribution[] = contributions.map(contrib => ({
        id: contrib.id,
        amount: contrib.amount,
        currency: contrib.currency,
        contributor_name: contrib.is_anonymous 
          ? 'Anonymous' 
          : (contrib as any).users?.raw_user_meta_data?.name || 
            (contrib as any).users?.email?.split('@')[0] || 
            'Anonymous',
        contribution_message: contrib.contribution_message || undefined,
        is_anonymous: contrib.is_anonymous,
        created_at: contrib.created_at,
        confirmed_at: contrib.confirmed_at || undefined,
        blockchain_tx_hash: contrib.blockchain_tx_hash
      }));

      const totalAmount = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
      const totalContributors = new Set(contributions.map(contrib => contrib.contributor_id)).size;

      console.log('✅ Retrieved contributions:', {
        count: contributions.length,
        totalAmount,
        totalContributors
      });

      return {
        success: true,
        contributions: formattedContributions,
        totalAmount,
        totalContributors
      };

    } catch (error: any) {
      console.error('❌ Error getting project contributions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user contributions
   */
  async getUserContributions(userId: string): Promise<{
    success: boolean;
    contributions?: ContributionData[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          projects(id, title, creator_id)
        `)
        .eq('contributor_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to get user contributions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, contributions: data };

    } catch (error: any) {
      console.error('❌ Error getting user contributions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process a complete contribution (save + update blockchain record)
   */
  async processContribution(
    projectId: string,
    contributorId: string,
    amount: number,
    currency: string,
    txHash: string,
    message?: string,
    isAnonymous?: boolean
  ): Promise<{
    success: boolean;
    contribution?: ContributionData;
    error?: string;
  }> {
    try {
      console.log('🔄 Processing contribution:', {
        projectId,
        contributorId,
        amount,
        currency,
        txHash
      });

      // First, get the project UUID
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return { success: false, error: 'Project not found' };
      }

      // Save the contribution
      const contributionData: Omit<ContributionData, 'id' | 'created_at'> = {
        project_id: project.id,
        contributor_id: contributorId,
        amount,
        currency,
        blockchain_tx_hash: txHash,
        status: 'pending',
        contribution_message: message,
        is_anonymous: isAnonymous || false
      };

      const saveResult = await this.saveContribution(contributionData);
      
      if (!saveResult.success) {
        return saveResult;
      }

      // Update project totals
      await this.updateProjectTotals(project.id);

      console.log('✅ Contribution processed successfully');
      return saveResult;

    } catch (error: any) {
      console.error('❌ Error processing contribution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update project total contributions and backers count
   */
  async updateProjectTotals(projectId: string): Promise<void> {
    try {
      // Get total contributions and contributor count manually
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('amount, contributor_id')
        .eq('project_id', projectId)
        .eq('status', 'confirmed');

      if (error) {
        console.error('❌ Error fetching contributions for totals:', error);
        return;
      }

      const total_amount = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
      const total_backers = new Set(contributions.map(contrib => contrib.contributor_id)).size;

      await supabase
        .from('projects')
        .update({
          current_funding: total_amount || 0,
          total_backers: total_backers || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      console.log('✅ Project totals updated:', { total_amount, total_backers });

    } catch (error) {
      console.error('❌ Error updating project totals:', error);
    }
  }

  /**
   * Check if user has contributed to a project
   */
  async hasUserContributed(projectId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('id')
        .eq('project_id', projectId)
        .eq('contributor_id', userId)
        .eq('status', 'confirmed')
        .limit(1);

      if (error) {
        console.error('❌ Error checking user contribution:', error);
        return false;
      }

      return data && data.length > 0;

    } catch (error) {
      console.error('❌ Error checking user contribution:', error);
      return false;
    }
  }

  /**
   * Get contribution by transaction hash
   */
  async getContributionByTxHash(txHash: string): Promise<{
    success: boolean;
    contribution?: ContributionData;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('blockchain_tx_hash', txHash)
        .single();

      if (error) {
        console.error('❌ Failed to get contribution by tx hash:', error);
        return { success: false, error: error.message };
      }

      return { success: true, contribution: data };

    } catch (error: any) {
      console.error('❌ Error getting contribution by tx hash:', error);
      return { success: false, error: error.message };
    }
  }
}

export const contributionsService = new ContributionsService();