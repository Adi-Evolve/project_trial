// Final Comprehensive Test - Using Correct Schema
// This test uses the actual column names discovered from the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, anonKey);

console.log('🎉 RLS POLICIES WORKING! Testing Full Data Flow...\n');

async function testUserCreation() {
  console.log('👤 TESTING USER CREATION:');
  
  const testUser = {
    id: crypto.randomUUID(),
    wallet_address: '0xbc96a75605fee7614b77877d9871a77ca9e7e022',
    username: 'adi_test_' + Date.now(),
    email: 'adi@example.com',
    full_name: 'Adi Test User'
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
      return null;
    } else {
      console.log('  ✅ Success! User created');
      console.log(`  📝 User ID: ${data[0].id}`);
      console.log(`  👤 Username: ${data[0].username}`);
      console.log(`  💼 Wallet: ${data[0].wallet_address}`);
      return data[0];
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
    return null;
  }
}

async function testProjectCreation(userId) {
  console.log('\n🚀 TESTING PROJECT CREATION:');
  
  const testProject = {
    id: crypto.randomUUID(),
    title: 'Test Funding Project',
    description: 'A test project for donation functionality',
    creator_id: userId,
    category: 'Technology',
    funding_goal: 1000,
    current_funding: 0,
    status: 'active'
  };
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([testProject])
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
      return null;
    } else {
      console.log('  ✅ Success! Project created');
      console.log(`  📝 Project ID: ${data[0].id}`);
      console.log(`  📊 Title: ${data[0].title}`);
      console.log(`  💰 Goal: ${data[0].funding_goal}`);
      return data[0];
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
    return null;
  }
}

async function testBlockchainTransaction(userId, projectId) {
  console.log('\n💰 TESTING BLOCKCHAIN TRANSACTION STORAGE:');
  
  const testTransaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    project_id: projectId,
    tx_hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
    amount_wei: '100000000000000000', // 0.1 ETH in wei
    currency: 'ETH',
    transaction_type: 'contribution',
    status: 'confirmed',
    block_number: 12345,
    network: 'sepolia'
  };
  
  try {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .insert([testTransaction])
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
      return null;
    } else {
      console.log('  ✅ Success! Transaction saved');
      console.log(`  📝 TX Hash: ${data[0].tx_hash}`);
      console.log(`  💰 Amount: ${data[0].amount_wei} wei`);
      console.log(`  🌍 Network: ${data[0].network}`);
      return data[0];
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
    return null;
  }
}

async function testContribution(userId, projectId) {
  console.log('\n🎯 TESTING CONTRIBUTION TRACKING:');
  
  const testContribution = {
    id: crypto.randomUUID(),
    user_id: userId,
    project_id: projectId,
    amount: 0.1,
    currency: 'ETH',
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('contributions')
      .insert([testContribution])
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
      return null;
    } else {
      console.log('  ✅ Success! Contribution tracked');
      console.log(`  📝 Contribution ID: ${data[0].id}`);
      console.log(`  💰 Amount: ${data[0].amount} ${data[0].currency}`);
      console.log(`  ✅ Status: ${data[0].status}`);
      return data[0];
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
    return null;
  }
}

async function testChatCreation(userId, projectId) {
  console.log('\n💬 TESTING CHAT CREATION:');
  
  const testChat = {
    id: crypto.randomUUID(),
    project_id: projectId,
    name: 'Project Discussion',
    type: 'project',
    created_by: userId
  };
  
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([testChat])
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
      return null;
    } else {
      console.log('  ✅ Success! Chat created');
      console.log(`  📝 Chat ID: ${data[0].id}`);
      console.log(`  💬 Name: ${data[0].name}`);
      console.log(`  🏷️  Type: ${data[0].type}`);
      return data[0];
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
    return null;
  }
}

async function testDataRetrieval() {
  console.log('\n📖 TESTING DATA RETRIEVAL:');
  
  // Get all users
  console.log('\n  👥 All Users:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, wallet_address, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    } else {
      console.log(`    ✅ Found ${data.length} users`);
      data.forEach(user => {
        console.log(`    - ${user.username} (${user.wallet_address?.substring(0, 8)}...)`);
      });
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  // Get all transactions
  console.log('\n  💰 All Transactions:');
  try {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .select('tx_hash, amount_wei, currency, network, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    } else {
      console.log(`    ✅ Found ${data.length} transactions`);
      data.forEach(tx => {
        console.log(`    - ${tx.tx_hash?.substring(0, 12)}... (${tx.amount_wei} wei on ${tx.network})`);
      });
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  // Get all contributions
  console.log('\n  🎯 All Contributions:');
  try {
    const { data, error } = await supabase
      .from('contributions')
      .select('amount, currency, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    } else {
      console.log(`    ✅ Found ${data.length} contributions`);
      data.forEach(contrib => {
        console.log(`    - ${contrib.amount} ${contrib.currency} (${contrib.status})`);
      });
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
}

async function runFinalTest() {
  console.log('🚀 FINAL COMPREHENSIVE SUPABASE TEST');
  console.log('='.repeat(50));
  console.log('Testing complete fund transfer flow...\n');
  
  // Step 1: Create user
  const user = await testUserCreation();
  if (!user) {
    console.log('\n❌ User creation failed - stopping test');
    return;
  }
  
  // Step 2: Create project
  const project = await testProjectCreation(user.id);
  if (!project) {
    console.log('\n❌ Project creation failed - stopping test');
    return;
  }
  
  // Step 3: Test blockchain transaction storage
  const transaction = await testBlockchainTransaction(user.id, project.id);
  
  // Step 4: Test contribution tracking
  const contribution = await testContribution(user.id, project.id);
  
  // Step 5: Test chat creation (for UUID fix verification)
  const chat = await testChatCreation(user.id, project.id);
  
  // Step 6: Retrieve all data
  await testDataRetrieval();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 FINAL TEST RESULTS:');
  console.log('='.repeat(50));
  
  console.log(`✅ User Creation: ${user ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ Project Creation: ${project ? 'SUCCESS' : 'FAILED'}`);
  console.log(`${transaction ? '✅' : '❌'} Transaction Storage: ${transaction ? 'SUCCESS' : 'FAILED'}`);
  console.log(`${contribution ? '✅' : '❌'} Contribution Tracking: ${contribution ? 'SUCCESS' : 'FAILED'}`);
  console.log(`${chat ? '✅' : '❌'} Chat Creation (UUID fix): ${chat ? 'SUCCESS' : 'FAILED'}`);
  
  if (user && project && transaction && contribution && chat) {
    console.log('\n🎉 ALL TESTS PASSED! Your Supabase integration is working perfectly!');
    console.log('📊 Fund transfers will now be properly saved to the database.');
    console.log('👤 User registration with MetaMask addresses works.');
    console.log('💰 Transaction hashes are being stored correctly.');
    console.log('🎯 Contribution tracking is functional.');
    console.log('💬 Chat system UUID errors are resolved.');
  } else {
    console.log('\n⚠️  Some operations failed - check the errors above for details.');
  }
}

// Run the final comprehensive test
runFinalTest().catch(console.error);