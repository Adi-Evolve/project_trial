import { supabase } from '../services/supabase';

/**
 * Check if a string is a valid UUID format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Get or create user UUID from wallet address
 */
export async function getUserUUIDFromWallet(walletAddress: string): Promise<string | null> {
  try {
    // First, try to find existing user by wallet address
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (!error && existingUser) {
      return existingUser.id;
    }

    // If user doesn't exist, create a minimal user record
    console.log('Creating minimal user record for wallet:', walletAddress);
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        wallet_address: walletAddress.toLowerCase(),
        email: null,
        username: walletAddress.slice(0, 10),
        full_name: `User ${walletAddress.slice(0, 8)}`,
        role: 'funder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (createError) {
      console.error('Failed to create minimal user record:', createError);
      return null;
    }

    console.log('Created minimal user record with UUID:', newUser.id);
    return newUser.id;

  } catch (error) {
    console.error('Error getting/creating user UUID:', error);
    return null;
  }
}

/**
 * Convert user ID to valid UUID for Supabase operations
 */
export async function ensureValidUserUUID(userId: string | undefined): Promise<string | null> {
  // Handle undefined or empty user ID
  if (!userId) {
    return null;
  }
  
  // If it's already a valid UUID, return it
  if (isValidUUID(userId)) {
    return userId;
  }

  // If it looks like a wallet address, try to get/create UUID
  if (userId.startsWith('0x') && userId.length === 42) {
    return await getUserUUIDFromWallet(userId);
  }

  console.warn('User ID is neither UUID nor wallet address:', userId);
  return null;
}