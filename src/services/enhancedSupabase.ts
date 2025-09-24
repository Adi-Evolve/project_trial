// Enhanced Supabase service with RLS error handling
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Create clients
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Enhanced error handling for Supabase operations
export class SupabaseErrorHandler {
  static handleError(error: any, operation: string): void {
    console.error(`Supabase ${operation} Error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    // Handle specific error types
    if (error.code === '42501') {
      console.warn('🔒 RLS Policy Violation - Consider:');
      console.warn('1. Adding proper RLS policies');
      console.warn('2. Using service role key');
      console.warn('3. Implementing user authentication');
    }
  }

  static isRLSError(error: any): boolean {
    return error.code === '42501' || 
           error.message?.includes('row-level security policy');
  }

  static isForeignKeyError(error: any): boolean {
    return error.code === '23503';
  }

  static isUniqueConstraintError(error: any): boolean {
    return error.code === '23505';
  }
}

// Enhanced database operations with fallbacks
export class EnhancedSupabaseService {
  
  // Try operation with admin client first, fallback to regular client
  static async tryWithFallback<T>(
    operation: (client: any) => Promise<T>,
    operationName: string
  ): Promise<T> {
    
    // Try with admin client first (bypasses RLS)
    if (supabaseAdmin) {
      try {
        console.log(`🔑 Attempting ${operationName} with service role...`);
        const result = await operation(supabaseAdmin);
        console.log(`✅ ${operationName} succeeded with service role`);
        return result;
      } catch (error: any) {
        console.warn(`⚠️ Service role ${operationName} failed:`, error.message);
      }
    }
    
    // Fallback to regular client
    try {
      console.log(`🔓 Attempting ${operationName} with anon key...`);
      const result = await operation(supabase);
      console.log(`✅ ${operationName} succeeded with anon key`);
      return result;
    } catch (error: any) {
      SupabaseErrorHandler.handleError(error, operationName);
      throw error;
    }
  }

  // Enhanced user operations
  static async createUser(userData: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'User Creation');
  }

  static async getUserByWallet(walletAddress: string) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    }, 'User Lookup');
  }

  static async updateUser(userId: string, updates: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'User Update');
  }

  // Enhanced transaction operations
  static async saveBlockchainTransaction(txData: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('blockchain_transactions')
        .insert([txData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'Blockchain Transaction Save');
  }

  static async updateTransactionStatus(txHash: string, updates: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('blockchain_transactions')
        .update(updates)
        .eq('tx_hash', txHash)
        .select();
      
      if (error) throw error;
      return data;
    }, 'Transaction Status Update');
  }

  // Enhanced contribution operations
  static async saveContribution(contributionData: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('contributions')
        .insert([contributionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'Contribution Save');
  }

  static async getContributionsByProject(projectId: string) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('contributions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }, 'Project Contributions Lookup');
  }

  // Enhanced project operations
  static async createProject(projectData: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'Project Creation');
  }

  static async updateProject(projectId: string, updates: any) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, 'Project Update');
  }

  static async getProjectById(projectId: string) {
    return this.tryWithFallback(async (client) => {
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }, 'Project Lookup');
  }

  // Test connection and permissions
  static async testConnection() {
    console.log('🧪 Testing Supabase Connection and Permissions...');
    
    try {
      // Test basic read access
      const { data: readTest, error: readError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      console.log('📖 Read test:', readError ? `❌ ${readError.message}` : '✅ OK');
      
      // Test write access
      const testData = {
        wallet_address: '0xtest' + Date.now(),
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        full_name: 'Connection Test User',
        role: 'funder'
      };
      
      try {
        const user = await this.createUser(testData);
        console.log('✍️ Write test: ✅ OK - Created user', user.id);
        
        // Cleanup
        await this.tryWithFallback(async (client) => {
          await client.from('users').delete().eq('id', user.id);
        }, 'Cleanup');
        
      } catch (writeError: any) {
        console.log('✍️ Write test: ❌', writeError.message);
        
        if (SupabaseErrorHandler.isRLSError(writeError)) {
          console.log('💡 RLS is blocking writes - run fix-rls-policies.sql');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message);
    }
  }
}

// Export enhanced client
export default EnhancedSupabaseService;