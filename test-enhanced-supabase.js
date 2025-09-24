// Test the enhanced Supabase service and RLS fixes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

console.log('🧪 Testing Enhanced Supabase Service & RLS Fixes\n');

async function testUserOperations() {
  console.log('1️⃣ Testing User Operations...');
  
  const testUserData = {
    wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
    email: `enhancedtest${Date.now()}@example.com`,
    username: `enhanceduser${Date.now()}`,
    full_name: 'Enhanced Test User',
    role: 'funder',
    bio: 'Testing enhanced Supabase service',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Test with admin client if available
    if (supabaseAdmin) {
      console.log('🔑 Testing with service role key...');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('users')
        .insert([testUserData])
        .select()
        .single();
      
      if (adminError) {
        console.log('❌ Admin insert failed:', adminError.message);
      } else {
        console.log('✅ Admin insert successful!', adminData.id);
        
        // Cleanup admin test
        await supabaseAdmin.from('users').delete().eq('id', adminData.id);
        console.log('🧹 Admin test user cleaned up');
      }
    }
    
    // Test with regular client (should work if RLS policies are fixed)
    console.log('🔓 Testing with anonymous key...');
    const { data: anonData, error: anonError } = await supabase
      .from('users')
      .insert([testUserData])
      .select()
      .single();
    
    if (anonError) {
      console.log('❌ Anonymous insert failed:', anonError.message);
      console.log('Code:', anonError.code);
      
      if (anonError.code === '42501') {
        console.log('🔒 RLS still blocking - run the SQL script: fix-rls-policies.sql');
      }
      
      return null;
    } else {
      console.log('✅ Anonymous insert successful!', anonData.id);
      return anonData.id;
    }
    
  } catch (error) {
    console.log('❌ User operation test failed:', error.message);
    return null;
  }
}

async function testTransactionOperations(userId) {
  if (!userId) {
    console.log('⏭️ Skipping transaction tests - no user ID');
    return;
  }
  
  console.log('\n2️⃣ Testing Transaction Operations...');
  
  try {
    // Test blockchain transaction insertion
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    const txData = {
      tx_hash: txHash,
      from_address: '0xbc96a75605fee7614b77877d9871a77ca9e7e022',
      to_address: '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66',
      value: 0.001,
      status: 'pending',
      function_name: 'donate',
      function_params: {
        projectId: 'test_project',
        amount: '0.001'
      },
      created_at: new Date().toISOString()
    };
    
    console.log('💰 Testing blockchain transaction insertion...');
    const { data: txResult, error: txError } = await supabase
      .from('blockchain_transactions')
      .insert([txData])
      .select()
      .single();
    
    if (txError) {
      console.log('❌ Transaction insert failed:', txError.message);
      if (txError.code === '42501') {
        console.log('🔒 RLS blocking transactions - run fix-rls-policies.sql');
      }
      return;
    } else {
      console.log('✅ Transaction inserted successfully!', txResult.id);
    }
    
    // Test transaction status update
    console.log('📝 Testing transaction status update...');
    const { data: updateResult, error: updateError } = await supabase
      .from('blockchain_transactions')
      .update({ 
        status: 'confirmed', 
        block_number: 12345,
        confirmed_at: new Date().toISOString()
      })
      .eq('tx_hash', txHash)
      .select();
    
    if (updateError) {
      console.log('❌ Transaction update failed:', updateError.message);
    } else {
      console.log('✅ Transaction updated successfully!');
    }
    
    return txResult.id;
    
  } catch (error) {
    console.log('❌ Transaction operation test failed:', error.message);
  }
}

async function testProjectAndContributionFlow(userId) {
  if (!userId) {
    console.log('⏭️ Skipping project tests - no user ID');
    return;
  }
  
  console.log('\n3️⃣ Testing Project & Contribution Flow...');
  
  try {
    // Create test project
    const projectData = {
      creator_id: userId,
      title: 'Enhanced Test Project',
      description: 'Testing project creation with enhanced service',
      category: 'technology',
      funding_goal: 1.0,
      current_funding: 0,
      currency: 'ETH',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🏗️ Creating test project...');
    const { data: projectResult, error: projectError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (projectError) {
      console.log('❌ Project creation failed:', projectError.message);
      if (projectError.code === '42501') {
        console.log('🔒 RLS blocking projects - run fix-rls-policies.sql');
      }
      return;
    } else {
      console.log('✅ Project created successfully!', projectResult.id);
    }
    
    // Create test contribution
    const contributionData = {
      project_id: projectResult.id,
      contributor_id: userId,
      amount: 0.001,
      currency: 'ETH',
      blockchain_tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
      status: 'confirmed',
      contribution_message: 'Enhanced service test contribution',
      is_anonymous: false,
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString()
    };
    
    console.log('💸 Creating test contribution...');
    const { data: contribResult, error: contribError } = await supabase
      .from('contributions')
      .insert([contributionData])
      .select()
      .single();
    
    if (contribError) {
      console.log('❌ Contribution creation failed:', contribError.message);
      if (contribError.code === '42501') {
        console.log('🔒 RLS blocking contributions - run fix-rls-policies.sql');
      }
    } else {
      console.log('✅ Contribution created successfully!', contribResult.id);
    }
    
    // Test project funding update
    console.log('📊 Testing project funding update...');
    const { data: updateResult, error: updateError } = await supabase
      .from('projects')
      .update({ 
        current_funding: contributionData.amount,
        total_backers: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectResult.id)
      .select();
    
    if (updateError) {
      console.log('❌ Project update failed:', updateError.message);
    } else {
      console.log('✅ Project funding updated successfully!');
    }
    
    return { projectId: projectResult.id, contribId: contribResult?.id };
    
  } catch (error) {
    console.log('❌ Project/contribution test failed:', error.message);
  }
}

async function cleanupTestData(userId, projectId, contribId, txId) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete in correct order (foreign key dependencies)
    if (contribId) {
      await supabase.from('contributions').delete().eq('id', contribId);
      console.log('✅ Test contribution deleted');
    }
    
    if (projectId) {
      await supabase.from('projects').delete().eq('id', projectId);
      console.log('✅ Test project deleted');
    }
    
    if (txId) {
      await supabase.from('blockchain_transactions').delete().eq('id', txId);
      console.log('✅ Test transaction deleted');
    }
    
    if (userId) {
      await supabase.from('users').delete().eq('id', userId);
      console.log('✅ Test user deleted');
    }
    
  } catch (error) {
    console.log('❌ Cleanup failed:', error.message);
  }
}

async function displayRLSStatus() {
  console.log('\n4️⃣ Checking RLS Status...');
  
  const tables = ['users', 'projects', 'contributions', 'blockchain_transactions'];
  
  for (const table of tables) {
    // Test read permission
    const { data: readData, error: readError } = await supabase
      .from(table)
      .select('count')
      .limit(1);
    
    // Test write permission  
    const { error: writeError } = await supabase
      .from(table)
      .insert([{ dummy: 'test' }]); // This will fail for various reasons, we just want to see the error
    
    const readStatus = readError ? '❌' : '✅';
    const writeStatus = writeError?.code === '42501' ? '🔒 RLS' : 
                       writeError ? '❌ Other' : '✅';
    
    console.log(`📋 ${table}: Read ${readStatus} | Write ${writeStatus}`);
  }
}

async function runEnhancedTests() {
  console.log('🚀 Starting Enhanced Supabase Tests\n');
  
  let userId, txId, projectId, contribId;
  
  try {
    userId = await testUserOperations();
    txId = await testTransactionOperations(userId);
    const projectResult = await testProjectAndContributionFlow(userId);
    
    if (projectResult) {
      projectId = projectResult.projectId;
      contribId = projectResult.contribId;
    }
    
    await displayRLSStatus();
    
  } finally {
    await cleanupTestData(userId, projectId, contribId, txId);
  }
  
  console.log('\n🏁 Enhanced test complete!');
  console.log('\n📋 If you see RLS errors, run this SQL in Supabase:');
  console.log('   👉 Execute the contents of fix-rls-policies.sql');
}

runEnhancedTests().catch(console.error);