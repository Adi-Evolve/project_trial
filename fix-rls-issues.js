// Fix RLS issues by updating Supabase services
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Analyzing and Fixing RLS Issues...\n');

async function checkRLSStatus() {
  console.log('1️⃣ Checking RLS Status on Tables...');
  
  // Check what tables we can access
  const tables = ['users', 'projects', 'contributions', 'blockchain_transactions'];
  
  for (const table of tables) {
    try {
      // Check if we can select (usually allowed)
      const { data: selectData, error: selectError } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      // Check if we can insert (usually blocked by RLS)
      const testData = generateTestData(table);
      const { data: insertData, error: insertError } = await supabase
        .from(table)
        .insert([testData]);
      
      console.log(`📋 Table: ${table}`);
      console.log(`  - SELECT: ${selectError ? '❌ ' + selectError.code : '✅ OK'}`);
      console.log(`  - INSERT: ${insertError ? '❌ ' + insertError.code : '✅ OK'}`);
      
      if (insertError && insertError.code === '42501') {
        console.log(`  - 🔒 RLS is blocking INSERTs on ${table}`);
      }
      
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

function generateTestData(table) {
  switch (table) {
    case 'users':
      return {
        wallet_address: '0x1234567890123456789012345678901234567890',
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        full_name: 'Test User',
        role: 'funder'
      };
    case 'projects':
      return {
        title: 'Test Project',
        description: 'Test Description',
        category: 'technology',
        funding_goal: 1.0,
        currency: 'ETH',
        status: 'draft'
      };
    case 'contributions':
      return {
        amount: 0.001,
        currency: 'ETH',
        blockchain_tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'pending'
      };
    case 'blockchain_transactions':
      return {
        tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        from_address: '0x1234567890123456789012345678901234567890',
        to_address: '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66',
        value: 0.001,
        status: 'pending'
      };
    default:
      return {};
  }
}

async function suggestSolutions() {
  console.log('\n2️⃣ Suggested Solutions for RLS Issues...\n');
  
  console.log('🔧 Solution Options:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🎯 Option 1: Get Service Role Key');
  console.log('- Contact your Supabase project admin');
  console.log('- Add REACT_APP_SUPABASE_SERVICE_ROLE_KEY to .env');
  console.log('- Service role bypasses all RLS policies');
  
  console.log('\n🎯 Option 2: Configure RLS Policies');
  console.log('- Allow anonymous inserts for testing');
  console.log('- Create policies that allow your operations');
  console.log('- Example: "Allow INSERT for authenticated users"');
  
  console.log('\n🎯 Option 3: Use Authentication');
  console.log('- Implement proper user authentication');
  console.log('- Sign in users before database operations');
  console.log('- RLS policies often allow operations for authenticated users');
  
  console.log('\n🎯 Option 4: Disable RLS (NOT RECOMMENDED for production)');
  console.log('- Only for development/testing');
  console.log('- SQL: ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
  
  console.log('\n📋 Current RLS Policy Examples Needed:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log(`
-- Allow anonymous users to insert into users table (for registration)
CREATE POLICY "allow_anonymous_user_insert" ON users
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to insert blockchain transactions
CREATE POLICY "allow_anonymous_tx_insert" ON blockchain_transactions
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to insert contributions  
CREATE POLICY "allow_anonymous_contrib_insert" ON contributions
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to insert projects
CREATE POLICY "allow_anonymous_project_insert" ON projects
  FOR INSERT WITH CHECK (true);
`);
}

async function testWithServiceRole() {
  console.log('\n3️⃣ Testing if Service Role Key is Available...');
  
  // Check if service role key exists in environment
  const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    console.log('❌ No service role key found in environment');
    console.log('💡 Add REACT_APP_SUPABASE_SERVICE_ROLE_KEY to your .env file');
    return;
  }
  
  console.log('✅ Service role key found, testing...');
  
  const serviceClient = createClient(supabaseUrl, serviceKey);
  
  try {
    const testUser = {
      wallet_address: '0xservice' + Date.now(),
      email: `servicetest${Date.now()}@example.com`,
      username: `serviceuser${Date.now()}`,
      full_name: 'Service Test User',
      role: 'funder'
    };
    
    const { data, error } = await serviceClient
      .from('users')
      .insert([testUser])
      .select();
    
    if (error) {
      console.log('❌ Service role insert failed:', error.message);
    } else {
      console.log('✅ Service role insert successful!');
      console.log('Created user with ID:', data[0].id);
      
      // Clean up
      await serviceClient.from('users').delete().eq('id', data[0].id);
      console.log('🧹 Cleaned up test user');
    }
    
  } catch (err) {
    console.log('❌ Service role test failed:', err.message);
  }
}

async function runRLSAnalysis() {
  await checkRLSStatus();
  await suggestSolutions();
  await testWithServiceRole();
  
  console.log('\n🏁 RLS Analysis Complete!');
  console.log('\n📄 Next Steps:');
  console.log('1. Get service role key from Supabase dashboard');
  console.log('2. Or create RLS policies to allow your operations');
  console.log('3. Test again with proper credentials/policies');
}

runRLSAnalysis().catch(console.error);