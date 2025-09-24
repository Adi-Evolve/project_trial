// Test script to verify Supabase transaction storage
import { supabase } from './src/services/supabase.js';

async function verifyTransactionStorage() {
  console.log('🔍 Verifying transaction storage in Supabase...');
  
  try {
    // Check contributions table
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (contributionsError) {
      console.error('❌ Error fetching contributions:', contributionsError);
    } else {
      console.log(`✅ Found ${contributions.length} contributions in database`);
      contributions.forEach(contrib => {
        console.log(`  📦 Contribution ${contrib.id}: ${contrib.amount} ${contrib.currency} - TX: ${contrib.blockchain_tx_hash}`);
      });
    }

    // Check blockchain transactions table
    const { data: transactions, error: transactionsError } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (transactionsError) {
      console.error('❌ Error fetching blockchain transactions:', transactionsError);
    } else {
      console.log(`✅ Found ${transactions.length} blockchain transactions in database`);
      transactions.forEach(tx => {
        console.log(`  ⛓️ Transaction ${tx.tx_hash}: ${tx.status} - Function: ${tx.function_name}`);
      });
    }

    // Check users table for UUID validation
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users in database`);
      users.forEach(user => {
        console.log(`  👤 User UUID: ${user.id} - Wallet: ${user.wallet_address}`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying transaction storage:', error);
  }
}

verifyTransactionStorage();