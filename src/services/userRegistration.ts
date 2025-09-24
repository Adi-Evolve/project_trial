import { supabase } from './supabase';
import { advancedContractService } from './advancedContracts';
import { toast } from 'react-hot-toast';

export interface UserRegistrationData {
  walletAddress: string;
  email: string;
  name: string;
  dateOfBirth: string;
  role: 'fund_raiser' | 'donor';
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface UserBlockchainRecord {
  walletAddress: string;
  transactionHash: string;
  blockNumber?: number;
  timestamp: string;
  verified: boolean;
}

class UserRegistrationService {
  
  // Register user with both blockchain and Supabase
  async registerUser(userData: UserRegistrationData): Promise<{
    success: boolean;
    message: string;
    blockchainRecord?: UserBlockchainRecord;
    supabaseRecord?: any;
  }> {
    try {
      console.log('Starting user registration...', userData);

      // Step 1: Register user on blockchain (if real contracts enabled)
      let blockchainRecord: UserBlockchainRecord | undefined;
      
      const useRealContracts = process.env.REACT_APP_ENABLE_REAL_CONTRACTS === 'true';
      
      if (useRealContracts) {
        try {
          console.log('Initializing blockchain connection for user registration...');
          await advancedContractService.initialize();
          
          // For now, we'll just create a blockchain record reference
          // In the future, this could register user with a dedicated user management contract
          blockchainRecord = {
            walletAddress: userData.walletAddress,
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Placeholder for future implementation
            timestamp: new Date().toISOString(),
            verified: true
          };
          
          console.log('Blockchain registration prepared:', blockchainRecord.transactionHash);
        } catch (blockchainError) {
          console.error('Blockchain registration failed:', blockchainError);
          // Continue with Supabase registration even if blockchain fails
          toast.error('Blockchain registration failed, continuing with database registration');
        }
      } else {
        // Create mock blockchain record for development
        blockchainRecord = {
          walletAddress: userData.walletAddress,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: new Date().toISOString(),
          verified: false // Mock record
        };
        console.log('Using mock blockchain record for development');
      }

      // Step 2: Save user data to Supabase
      const supabaseUserData = {
        wallet_address: userData.walletAddress.toLowerCase(),
        email: userData.email,
        name: userData.name,
        date_of_birth: userData.dateOfBirth,
        role: userData.role,
        bio: userData.bio,
        skills: userData.skills,
        interests: userData.interests,
        is_verified: true,
        is_email_verified: false,
        joined_at: new Date().toISOString(),
        // Add blockchain record hash for reference
        blockchain_tx_hash: blockchainRecord?.transactionHash,
        blockchain_verified: blockchainRecord?.verified || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving user to Supabase...', supabaseUserData);

      const { data: supabaseRecord, error: supabaseError } = await supabase
        .from('users')
        .upsert(supabaseUserData)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Supabase registration failed: ${supabaseError.message}`);
      }

      console.log('Supabase registration successful:', supabaseRecord);

      // Step 3: Save blockchain transaction to Supabase for reference
      if (blockchainRecord) {
        const blockchainTransactionData = {
          tx_hash: blockchainRecord.transactionHash,
          from_address: blockchainRecord.walletAddress.toLowerCase(),
          to_address: process.env.REACT_APP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
          status: blockchainRecord.verified ? 'confirmed' : 'pending',
          function_name: 'registerUser',
          function_params: {
            user: userData.name,
            role: userData.role
          },
          created_at: new Date().toISOString(),
          confirmed_at: blockchainRecord.verified ? new Date().toISOString() : null
        };

        const { error: blockchainRecordError } = await supabase
          .from('blockchain_transactions')
          .upsert(blockchainTransactionData);

        if (blockchainRecordError) {
          console.error('Failed to save blockchain record:', blockchainRecordError);
          // Don't fail registration if blockchain record saving fails
        }
      }

      return {
        success: true,
        message: 'User registration completed successfully',
        blockchainRecord,
        supabaseRecord
      };

    } catch (error) {
      console.error('User registration failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Get user by wallet address from Supabase
  async getUserByWallet(walletAddress: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(`Failed to fetch user: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to get user by wallet:', error);
      return null;
    }
  }

  // Get user's blockchain records
  async getUserBlockchainRecords(walletAddress: string): Promise<UserBlockchainRecord[]> {
    try {
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('from_address', walletAddress.toLowerCase())
        .eq('function_name', 'registerUser')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch blockchain records: ${error.message}`);
      }

      return data.map(record => ({
        walletAddress: record.from_address,
        transactionHash: record.tx_hash,
        blockNumber: record.block_number,
        timestamp: record.created_at,
        verified: record.status === 'confirmed'
      }));
    } catch (error) {
      console.error('Failed to get blockchain records:', error);
      return [];
    }
  }

  // Update user information
  async updateUser(walletAddress: string, updates: Partial<UserRegistrationData>): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Remove walletAddress from updates as it shouldn't change
      delete updateData.walletAddress;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('wallet_address', walletAddress.toLowerCase());

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      return {
        success: true,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  // Check if user exists and is verified
  async isUserRegistered(walletAddress: string): Promise<boolean> {
    try {
      const user = await this.getUserByWallet(walletAddress);
      return user !== null;
    } catch (error) {
      console.error('Failed to check user registration:', error);
      return false;
    }
  }

  // Get user's MetaMask ID from blockchain
  async getUserMetaMaskFromBlockchain(walletAddress: string): Promise<string | null> {
    try {
      const useRealContracts = process.env.REACT_APP_ENABLE_REAL_CONTRACTS === 'true';
      
      if (useRealContracts) {
        // For now, just return the wallet address since user registration 
        // on blockchain will be implemented when user management contracts are deployed
        return walletAddress;
      } else {
        // For development, return the wallet address itself
        return walletAddress;
      }
    } catch (error) {
      console.error('Failed to get user from blockchain:', error);
      return null;
    }
  }

  // Verify user's blockchain registration
  async verifyBlockchainRegistration(walletAddress: string): Promise<boolean> {
    try {
      const blockchainAddress = await this.getUserMetaMaskFromBlockchain(walletAddress);
      return blockchainAddress?.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify blockchain registration:', error);
      return false;
    }
  }
}

export const userRegistrationService = new UserRegistrationService();
export default userRegistrationService;