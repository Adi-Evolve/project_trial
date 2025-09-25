import { supabase } from './supabase';
import EnhancedSupabaseService from './enhancedSupabase';
import { toast } from 'react-hot-toast';

export interface ContributionData {
  id?: string;
  project_id: string;
  contributor_id: string | null; // Allow null for anonymous contributions
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
  is_zkp?: boolean;
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
      console.log('� SAVE CONTRIBUTION - Starting save process...');
      console.log('📝 Contribution to save:', JSON.stringify(contribution, null, 2));

      // Try enhanced service first
      console.log('🔄 Attempting enhanced service save...');
      try {
        const data = await EnhancedSupabaseService.saveContribution(contribution);
        console.log('✅ Enhanced service save successful:', data);
        return { success: true, contribution: data };
      } catch (enhancedError: any) {
        console.error('❌ Enhanced service failed:', enhancedError.message);
        console.log('🔄 Falling back to direct Supabase insert...');
        
        // Fallback to direct insert
        console.log('📤 Making direct insert to contributions table...');
        // Defensive insert: attempt to insert with is_zkp, but fall back if column doesn't exist
        let insertPayload: any = { ...contribution };
        try {
          const { data, error } = await supabase
            .from('contributions')
            .insert([insertPayload])
            .select()
            .single();

          if (error) throw error;

          console.log('✅ Contribution saved successfully (direct):', data);
          return { success: true, contribution: data };
        } catch (insertErr: any) {
          const msg = insertErr?.message || String(insertErr || '');
          // If column missing (e.g., is_zkp), retry without that field
          if (msg.includes('is_zkp') || msg.includes('could not find') || msg.includes('undefined column')) {
            try {
              const fallback = { ...insertPayload };
              delete fallback.is_zkp;
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('contributions')
                .insert([fallback])
                .select()
                .single();

              if (fallbackError) {
                console.error('❌ Failed to save contribution (fallback):', fallbackError);
                return { success: false, error: fallbackError.message };
              }

              console.log('✅ Contribution saved successfully (fallback):', fallbackData);
              return { success: true, contribution: fallbackData };
            } catch (fbErr: any) {
              console.error('❌ Fallback insert failed:', fbErr);
              return { success: false, error: fbErr.message || String(fbErr) };
            }
          }

          // Not a schema issue, bubble up
          console.error('❌ Failed to save contribution:', insertErr);
          return { success: false, error: insertErr.message || String(insertErr) };
        }

        
      }

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

      // If not found by UUID, try by exact title match
      if (projectError || !project) {
        const { data: projectByTitle, error: titleError } = await supabase
          .from('projects')
          .select('id')
          .eq('title', projectId)
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

      // Try the embedded join first (fast) but fall back to separate queries if Supabase schema cache lacks the relationship
      let contribsArray: any[] = [];
      try {
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
            contributor_wallet,
            users!inner(email, raw_user_meta_data, wallet_address)
          `)
          .eq('project_id', project.id)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false });

        if (error) throw error;

        contribsArray = (contributions as any) || [];
      } catch (err: any) {
        // If PostgREST returns PGRST200 (relationship missing) or similar, perform safe client-side merge
        const msg = err?.message || String(err || '');
        console.warn('⚠️ Embedded join failed for contributions. Falling back to separate queries:', msg);

        // Fetch contributions without join
        const { data: simpleContribs, error: simpleError } = await supabase
          .from('contributions')
          .select(`id, amount, currency, contribution_message, is_anonymous, created_at, confirmed_at, blockchain_tx_hash, contributor_id, status`)
          .eq('project_id', project.id)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false });

        if (simpleError) {
          console.error('❌ Failed to fetch contributions (fallback):', simpleError);
          return { success: false, error: simpleError.message };
        }

        const contribs = (simpleContribs as any[]) || [];

        // Collect contributor IDs and wallet addresses that are present
        const userIds = contribs.map(c => c.contributor_id).filter(Boolean);

        let usersMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, raw_user_meta_data, wallet_address')
            .in('id', userIds);

          if (!usersError && users) {
            for (const u of users as any[]) {
              usersMap[u.id] = u;
            }
          }
        }

        // Merge user info into contributions
  contribsArray = contribs.map(c => ({ ...c, users: usersMap[c.contributor_id], contributor_wallet: (c as any).contributor_wallet }));
      }

      const formattedContributions: ProjectContribution[] = contribsArray.map(contrib => ({
        id: contrib.id,
        amount: contrib.amount,
        currency: contrib.currency,
        // Prefer explicit wallet if stored on contribution row, else use associated user's wallet, otherwise show name/email fallback
        contributor_name: contrib.is_anonymous
          ? 'Anonymous'
          : (contrib as any).contributor_wallet || (contrib as any).users?.wallet_address || (contrib as any).users?.raw_user_meta_data?.name || (contrib as any).users?.email?.split('@')[0] || 'Anonymous',
        contribution_message: contrib.contribution_message || undefined,
        is_anonymous: contrib.is_anonymous,
        created_at: contrib.created_at,
        confirmed_at: contrib.confirmed_at || undefined,
        blockchain_tx_hash: contrib.blockchain_tx_hash
      }));

  const totalAmount = contribsArray.reduce((sum, contrib) => sum + contrib.amount, 0);
  const totalContributors = new Set(contribsArray.map(contrib => contrib.contributor_id)).size;

      console.log('✅ Retrieved contributions:', {
        count: contribsArray.length,
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
    isAnonymous?: boolean,
    isZkp?: boolean
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

      // First, get the project UUID - try by ID first, then by title
      console.log('🔍 Step 1: Looking up project in database...');
      console.log('🎯 Project ID to find:', projectId);
      
      let project = null;
      let projectError = null;

      // Try direct UUID lookup first
      console.log('🔄 Trying direct UUID lookup...');
      const { data: directProject, error: directError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      console.log('📊 Direct lookup result:', {
        found: !!directProject,
        project: directProject,
        error: directError?.message
      });

      if (directProject) {
        console.log('✅ Found project by UUID:', directProject.id);
        project = directProject;
      } else {
        console.log('❌ Direct UUID lookup failed, trying title lookup...');
        // If direct lookup fails, try by title (for blockchain project IDs)
        const { data: titleProject, error: titleError } = await supabase
          .from('projects')
          .select('id')
          .eq('title', projectId)
          .single();
        
        console.log('📊 Title lookup result:', {
          found: !!titleProject,
          project: titleProject,
          error: titleError?.message
        });
        
        if (titleProject) {
          console.log('✅ Found project by title:', titleProject.id);
          project = titleProject;
        } else {
          console.error('❌ Title lookup also failed:', titleError?.message);
          projectError = titleError;
        }
      }

      if (projectError || !project) {
        console.error('❌ PROJECT LOOKUP FAILED COMPLETELY!');
        console.error('🔍 Debugging info:');
        console.error('   - Searched project ID:', projectId);
        console.error('   - Direct error:', directError?.message);
        console.error('   - Title error:', projectError?.message);
        console.error('   - Project found:', !!project);
        return { success: false, error: `Project not found: ${projectId}` };
      }

      // Handle contributor ID - if it's a wallet address, try to find user or use null
      console.log('🔍 Step 2: Processing contributor ID...');
      console.log('👤 Original contributor ID:', contributorId);
      
      let finalContributorId: string | null = contributorId;
      
      // Check if contributorId looks like a wallet address (starts with 0x)
      if (contributorId && contributorId.startsWith('0x')) {
        console.log('🔄 Contributor ID is a wallet address, looking up user...');
        // Try to find user by wallet address
        const { data: userByWallet, error: walletError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', contributorId)
          .single();
          
        console.log('📊 Wallet lookup result:', {
          found: !!userByWallet,
          userId: userByWallet?.id,
          error: walletError?.message
        });
          
        if (userByWallet) {
          console.log('✅ Found user for wallet:', userByWallet.id);
          finalContributorId = userByWallet.id;
        } else {
          console.log('⚠️ No user found for wallet, using anonymous contribution');
          finalContributorId = null;
        }
      } else {
        console.log('✅ Contributor ID is already a UUID:', contributorId);
      }
      
      console.log('👤 Final contributor ID:', finalContributorId);

      // Save the contribution
      console.log('🔍 Step 3: Preparing contribution data...');
      const contributionData: Omit<ContributionData, 'id' | 'created_at'> = {
        project_id: project.id,
        contributor_id: finalContributorId,
        amount,
        currency,
        blockchain_tx_hash: txHash,
        status: 'pending',
        contribution_message: message,
        is_anonymous: isAnonymous || false,
        is_zkp: isZkp || false
      };

      console.log('📝 Contribution data to save:', contributionData);
      console.log('🔄 Calling saveContribution...');

      const saveResult = await this.saveContribution(contributionData);
      
      console.log('📊 Save contribution result:', saveResult);
      
      if (!saveResult.success) {
        console.error('❌ CONTRIBUTION SAVE FAILED!');
        console.error('🔍 Save error details:', saveResult.error);
        return saveResult;
      }
      
      console.log('✅ Contribution saved successfully:', saveResult.contribution?.id);

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