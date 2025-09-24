// Test transaction and contribution data saving
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransactionOperations() {
  console.log('🧪 Testing Transaction & Contribution Operations...\n');
  
  let testUserId = null;
  let testProjectId = null;
  
  try {
    // Step 1: Create a test user first
    console.log('1️⃣ Creating test user...');
    const testUserData = {
      wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      email: `testuser${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      full_name: 'Test User for Transactions',
      role: 'funder'
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUserData])
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Failed to create test user:', userError);
      return;
    }
    
    testUserId = userData.id;
    console.log('✅ Test user created:', testUserId);
    
    // Step 2: Create a test project
    console.log('\n2️⃣ Creating test project...');
    const testProjectData = {
      creator_id: testUserId,
      title: 'Test Project for Transactions',
      description: 'A test project to verify transaction storage',
      category: 'technology',
      funding_goal: 1.0,
      current_funding: 0,
      currency: 'ETH',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'active'
    };
    
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([testProjectData])
      .select()
      .single();
    
    if (projectError) {
      console.error('❌ Failed to create test project:', projectError);
      return;
    }
    
    testProjectId = projectData.id;
    console.log('✅ Test project created:', testProjectId);
    
    // Step 3: Test blockchain transaction insertion
    console.log('\n3️⃣ Testing blockchain transaction insertion...');
    const testTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    const blockchainTxData = {
      tx_hash: testTxHash,
      from_address: testUserData.wallet_address,
      to_address: '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66', // Contract address
      value: 0.001,
      status: 'pending',
      function_name: 'donate',
      function_params: {
        projectId: 'test_project_123',
        amount: '0.001'
      },
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting blockchain transaction:', JSON.stringify(blockchainTxData, null, 2));
    
    const { data: txData, error: txError } = await supabase
      .from('blockchain_transactions')
      .insert([blockchainTxData])
      .select();
    
    if (txError) {
      console.error('❌ Blockchain transaction insertion failed:', txError);
      console.error('Error details:', {
        code: txError.code,
        message: txError.message,
        details: txError.details,
        hint: txError.hint
      });
    } else {
      console.log('✅ Blockchain transaction inserted successfully!');
      console.log('Inserted transaction:', txData[0]);
    }
    
    // Step 4: Test contribution insertion
    console.log('\n4️⃣ Testing contribution insertion...');
    const contributionData = {
      project_id: testProjectId,
      contributor_id: testUserId,
      amount: 0.001,
      currency: 'ETH',
      blockchain_tx_hash: testTxHash,
      status: 'pending',
      contribution_message: 'Test contribution for database verification',
      is_anonymous: false,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting contribution:', JSON.stringify(contributionData, null, 2));
    
    const { data: contribData, error: contribError } = await supabase
      .from('contributions')
      .insert([contributionData])
      .select();
    
    if (contribError) {
      console.error('❌ Contribution insertion failed:', contribError);
      console.error('Error details:', {
        code: contribError.code,
        message: contribError.message,
        details: contribError.details,
        hint: contribError.hint
      });
    } else {
      console.log('✅ Contribution inserted successfully!');
      console.log('Inserted contribution:', contribData[0]);
    }
    
    // Step 5: Test data retrieval
    console.log('\n5️⃣ Testing data retrieval...');
    
    // Get all contributions for the project
    const { data: projectContribs, error: contribRetrieveError } = await supabase
      .from('contributions')
      .select('*')
      .eq('project_id', testProjectId);
    
    if (contribRetrieveError) {
      console.error('❌ Contribution retrieval failed:', contribRetrieveError);
    } else {
      console.log('✅ Retrieved contributions:', projectContribs.length);
      projectContribs.forEach(contrib => {
        console.log(`  - ${contrib.amount} ${contrib.currency} from user ${contrib.contributor_id}`);
      });
    }
    
    // Get all transactions by hash
    const { data: txByHash, error: txRetrieveError } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('tx_hash', testTxHash);
    
    if (txRetrieveError) {
      console.error('❌ Transaction retrieval failed:', txRetrieveError);
    } else {
      console.log('✅ Retrieved transactions by hash:', txByHash.length);
      txByHash.forEach(tx => {
        console.log(`  - TX ${tx.tx_hash}: ${tx.status} (${tx.function_name})`);
      });
    }
    
    return { testUserId, testProjectId };
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return { testUserId, testProjectId };
  }
}

async function cleanupTestData({ testUserId, testProjectId }) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete contributions first (foreign key dependency)
    if (testProjectId) {
      const { error: contribDeleteError } = await supabase
        .from('contributions')
        .delete()
        .eq('project_id', testProjectId);
      
      if (contribDeleteError) {
        console.error('❌ Failed to delete test contributions:', contribDeleteError);
      } else {
        console.log('✅ Test contributions deleted');
      }
    }
    
    // Delete blockchain transactions
    const { error: txDeleteError } = await supabase
      .from('blockchain_transactions')
      .delete()
      .like('tx_hash', '0x%');
    
    if (txDeleteError) {
      console.error('❌ Failed to delete test transactions:', txDeleteError);
    } else {
      console.log('✅ Test transactions deleted');
    }
    
    // Delete test project
    if (testProjectId) {
      const { error: projectDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', testProjectId);
      
      if (projectDeleteError) {
        console.error('❌ Failed to delete test project:', projectDeleteError);
      } else {
        console.log('✅ Test project deleted');
      }
    }
    
    // Delete test user
    if (testUserId) {
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);
      
      if (userDeleteError) {
        console.error('❌ Failed to delete test user:', userDeleteError);
      } else {
        console.log('✅ Test user deleted');
      }
    }
    
  } catch (error) {
    console.error('❌ Cleanup exception:', error);
  }
}

async function runTransactionTests() {
  console.log('🚀 Starting Transaction Database Tests\n');
  
  const testData = await testTransactionOperations();
  if (testData) {
    await cleanupTestData(testData);
  }
  
  console.log('\n🏁 Transaction test complete!');
}

runTransactionTests().catch(console.error);