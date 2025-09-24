// Test Full Flow - Complete Supabase Testing After RLS Fix
// This tests both anonymous and service role operations

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test both clients
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 Environment Check:');
console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('Anon Key:', anonKey ? '✅ Present' : '❌ Missing');
console.log('Service Key:', serviceKey ? '✅ Present' : '❌ Missing');
console.log('');

// Create clients
const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

// Test data
const testWalletAddress = '0xbc96a75605fee7614b77877d9871a77ca9e7e022';
const testUser = {
  id: crypto.randomUUID(),
  wallet_address: testWalletAddress,
  username: 'test_user_' + Date.now(),
  email: 'test@example.com',
  full_name: 'Test User',
  bio: 'Test bio for RLS testing',
  avatar_url: null,
  reputation_score: 0,
  total_contributions: 0,
  skills: ['Testing', 'Blockchain'],
  github_profile: null,
  twitter_profile: null,
  linkedin_profile: null,
  portfolio_url: null,
  notification_preferences: {
    email_notifications: true,
    push_notifications: true
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const testProject = {
  id: crypto.randomUUID(),
  title: 'Test Project RLS',
  description: 'Testing project creation after RLS fix',
  creator_id: testUser.id,
  category: 'Technology',
  tags: ['testing', 'rls'],
  status: 'active',
  funding_goal: 1000,
  current_funding: 0,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function testTableAccess(client, clientName) {
  console.log(`\n🧪 Testing ${clientName} Access:`);
  
  const tables = [
    'users', 'projects', 'contributions', 'blockchain_transactions',
    'chats', 'chat_messages', 'ideas', 'notifications'
  ];
  
  for (const table of tables) {
    try {
      // Test SELECT
      const { data, error } = await client.from(table).select('*').limit(1);
      const readStatus = error ? '❌' : '✅';
      
      console.log(`  📋 ${table}: Read ${readStatus}`);
      if (error && error.code !== 'PGRST116') {
        console.log(`    Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`  📋 ${table}: Read ❌ (${err.message})`);
    }
  }
}

async function testUserOperations() {
  console.log('\n👤 Testing User Operations:');
  
  // Test with Anonymous Client
  console.log('\n  📝 Anonymous Client User Insert:');
  try {
    const { data, error } = await supabaseAnon
      .from('users')
      .insert([testUser])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! User created with anonymous client');
      console.log(`    User ID: ${data[0].id}`);
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  // Test with Service Role Client
  console.log('\n  🔑 Service Role Client User Insert:');
  try {
    const serviceTestUser = {
      ...testUser,
      id: crypto.randomUUID(),
      username: 'service_user_' + Date.now()
    };
    
    const { data, error } = await supabaseService
      .from('users')
      .insert([serviceTestUser])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! User created with service role');
      console.log(`    User ID: ${data[0].id}`);
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
}

async function testProjectOperations() {
  console.log('\n🚀 Testing Project Operations:');
  
  // Test project creation with anonymous client
  console.log('\n  📝 Anonymous Client Project Insert:');
  try {
    const { data, error } = await supabaseAnon
      .from('projects')
      .insert([testProject])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! Project created with anonymous client');
      console.log(`    Project ID: ${data[0].id}`);
      return data[0].id;
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  return null;
}

async function testTransactionOperations(projectId) {
  console.log('\n💰 Testing Transaction Operations:');
  
  const testTransaction = {
    id: crypto.randomUUID(),
    user_id: testUser.id,
    project_id: projectId || crypto.randomUUID(),
    transaction_hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
    amount: '0.1',
    currency: 'ETH',
    transaction_type: 'contribution',
    status: 'confirmed',
    block_number: 12345,
    gas_used: 21000,
    gas_price: '20000000000',
    network: 'sepolia',
    created_at: new Date().toISOString()
  };
  
  console.log('\n  📝 Anonymous Client Transaction Insert:');
  try {
    const { data, error } = await supabaseAnon
      .from('blockchain_transactions')
      .insert([testTransaction])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! Transaction saved with anonymous client');
      console.log(`    TX Hash: ${data[0].transaction_hash}`);
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
}

async function testContributionOperations(projectId) {
  console.log('\n🎯 Testing Contribution Operations:');
  
  const testContribution = {
    id: crypto.randomUUID(),
    user_id: testUser.id,
    project_id: projectId || crypto.randomUUID(),
    amount: 0.1,
    currency: 'ETH',
    transaction_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  
  console.log('\n  📝 Anonymous Client Contribution Insert:');
  try {
    const { data, error } = await supabaseAnon
      .from('contributions')
      .insert([testContribution])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! Contribution saved with anonymous client');
      console.log(`    Amount: ${data[0].amount} ${data[0].currency}`);
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
}

async function testChatOperations() {
  console.log('\n💬 Testing Chat Operations:');
  
  const testChat = {
    id: crypto.randomUUID(),
    project_id: crypto.randomUUID(),
    name: 'Test Chat RLS',
    description: 'Testing chat creation after RLS fix',
    created_by: testUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('\n  📝 Anonymous Client Chat Insert:');
  try {
    const { data, error } = await supabaseAnon
      .from('chats')
      .insert([testChat])
      .select();
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log('    ✅ Success! Chat created with anonymous client');
      console.log(`    Chat ID: ${data[0].id}`);
      return data[0].id;
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  return null;
}

async function testDataRetrieval() {
  console.log('\n📖 Testing Data Retrieval:');
  
  // Test reading users with wallet address
  console.log('\n  🔍 Finding users by wallet address:');
  try {
    const { data, error } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('wallet_address', testWalletAddress);
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    } else {
      console.log(`    ✅ Found ${data.length} users with wallet ${testWalletAddress}`);
      if (data.length > 0) {
        console.log(`    Latest user: ${data[data.length - 1].username}`);
      }
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
  
  // Test reading transactions
  console.log('\n  🔍 Reading blockchain transactions:');
  try {
    const { data, error } = await supabaseAnon
      .from('blockchain_transactions')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    } else {
      console.log(`    ✅ Retrieved ${data.length} recent transactions`);
      data.forEach(tx => {
        console.log(`    - ${tx.transaction_hash.substring(0, 10)}... (${tx.amount} ${tx.currency})`);
      });
    }
  } catch (err) {
    console.log(`    ❌ Exception: ${err.message}`);
  }
}

async function runFullTest() {
  console.log('🚀 SUPABASE FULL FLOW TEST - POST RLS FIX');
  console.log('='.repeat(50));
  
  // Test basic access
  await testTableAccess(supabaseAnon, 'Anonymous');
  await testTableAccess(supabaseService, 'Service Role');
  
  // Test operations
  await testUserOperations();
  const projectId = await testProjectOperations();
  await testTransactionOperations(projectId);
  await testContributionOperations(projectId);
  await testChatOperations();
  
  // Test retrieval
  await testDataRetrieval();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Test Complete!');
  console.log('\nIf you see ✅ for INSERT operations, your RLS fix worked!');
  console.log('If you see ❌ still, check if the SQL script ran successfully.');
}

// Run the test
runFullTest().catch(console.error);