// Test RLS (Row Level Security) policies and permissions
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔒 Testing RLS Policies and Permissions...\n');

const anonClient = createClient(supabaseUrl, supabaseKey);
const serviceClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function testAnonymousAccess() {
  console.log('1️⃣ Testing Anonymous Access...');
  
  const tables = ['users', 'projects', 'contributions', 'blockchain_transactions'];
  
  for (const table of tables) {
    try {
      // Test SELECT
      const { data, error } = await anonClient
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} SELECT (anon): ${error.message}`);
      } else {
        console.log(`✅ ${table} SELECT (anon): Allowed (${data.length} records)`);
      }
      
      // Test INSERT
      const testData = getTestDataForTable(table);
      const { error: insertError } = await anonClient
        .from(table)
        .insert([testData]);
      
      if (insertError) {
        console.log(`❌ ${table} INSERT (anon): ${insertError.message}`);
      } else {
        console.log(`✅ ${table} INSERT (anon): Allowed`);
        
        // Clean up if insert was successful
        await anonClient.from(table).delete().eq('id', testData.id || 'nonexistent');
      }
      
    } catch (error) {
      console.log(`❌ ${table} (anon): Exception - ${error.message}`);
    }
  }
}

async function testServiceRoleAccess() {
  if (!serviceClient) {
    console.log('\n2️⃣ Skipping Service Role Access (no service key provided)');
    return;
  }
  
  console.log('\n2️⃣ Testing Service Role Access...');
  
  const tables = ['users', 'projects', 'contributions', 'blockchain_transactions'];
  
  for (const table of tables) {
    try {
      // Test SELECT
      const { data, error } = await serviceClient
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} SELECT (service): ${error.message}`);
      } else {
        console.log(`✅ ${table} SELECT (service): Allowed (${data.length} records)`);
      }
      
      // Test INSERT
      const testData = getTestDataForTable(table);
      const { data: insertData, error: insertError } = await serviceClient
        .from(table)
        .insert([testData])
        .select();
      
      if (insertError) {
        console.log(`❌ ${table} INSERT (service): ${insertError.message}`);
      } else {
        console.log(`✅ ${table} INSERT (service): Allowed`);
        
        // Clean up if insert was successful
        if (insertData && insertData[0]) {
          await serviceClient.from(table).delete().eq('id', insertData[0].id);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${table} (service): Exception - ${error.message}`);
    }
  }
}

function getTestDataForTable(table) {
  const timestamp = new Date().toISOString();
  const randomId = crypto.randomUUID ? crypto.randomUUID() : 'test-' + Date.now();
  
  switch (table) {
    case 'users':
      return {
        wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        full_name: 'Test User RLS',
        role: 'funder'
      };
    
    case 'projects':
      return {
        creator_id: randomId, // This will likely fail due to FK constraint
        title: 'Test Project RLS',
        description: 'Test project for RLS testing',
        category: 'technology',
        funding_goal: 1.0,
        currency: 'ETH',
        status: 'draft'
      };
    
    case 'contributions':
      return {
        project_id: randomId, // This will likely fail due to FK constraint
        contributor_id: randomId, // This will likely fail due to FK constraint
        amount: 0.001,
        currency: 'ETH',
        blockchain_tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'pending'
      };
    
    case 'blockchain_transactions':
      return {
        tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        from_address: '0x' + Math.random().toString(16).substr(2, 40),
        to_address: '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66',
        value: 0.001,
        status: 'pending',
        function_name: 'test'
      };
    
    default:
      return { id: randomId };
  }
}

async function testRLSPolicyDetails() {
  console.log('\n3️⃣ Testing RLS Policy Details...');
  
  try {
    // Check if RLS is enabled on tables
    const { data: rlsInfo, error: rlsError } = await anonClient.rpc('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (rlsError) {
      console.log('❌ Could not check RLS status:', rlsError.message);
    } else {
      console.log('✅ RLS check completed (limited info available via anon client)');
    }
    
  } catch (error) {
    console.log('❌ RLS detail check failed:', error.message);
  }
}

async function testSpecificOperations() {
  console.log('\n4️⃣ Testing Specific Operations...');
  
  try {
    // Test user creation (most common operation)
    console.log('Testing user creation...');
    const userData = {
      wallet_address: '0xtest' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      full_name: 'Test User Specific',
      role: 'funder',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: user, error: userError } = await anonClient
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (userError) {
      console.log('❌ User creation failed:', userError.message);
      console.log('Error code:', userError.code);
      console.log('Error details:', userError.details);
    } else {
      console.log('✅ User created successfully:', user.id);
      
      // Test transaction creation
      console.log('Testing transaction creation...');
      const txData = {
        tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        from_address: userData.wallet_address,
        to_address: '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66',
        value: 0.001,
        status: 'pending',
        function_name: 'donate',
        created_at: new Date().toISOString()
      };
      
      const { data: tx, error: txError } = await anonClient
        .from('blockchain_transactions')
        .insert([txData])
        .select()
        .single();
      
      if (txError) {
        console.log('❌ Transaction creation failed:', txError.message);
        console.log('Error code:', txError.code);
      } else {
        console.log('✅ Transaction created successfully:', tx.id);
        
        // Clean up transaction
        await anonClient.from('blockchain_transactions').delete().eq('id', tx.id);
      }
      
      // Clean up user
      await anonClient.from('users').delete().eq('id', user.id);
      console.log('✅ Cleanup completed');
    }
    
  } catch (error) {
    console.log('❌ Specific operations test failed:', error.message);
  }
}

async function runRLSTests() {
  console.log('🚀 Starting RLS and Permissions Tests\n');
  
  await testAnonymousAccess();
  await testServiceRoleAccess();
  await testRLSPolicyDetails();
  await testSpecificOperations();
  
  console.log('\n🏁 RLS test complete!');
}

runRLSTests().catch(console.error);