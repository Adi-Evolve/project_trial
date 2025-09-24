// Test script to verify Supabase connection and schema compliance
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing Supabase connection and schema...\n');

    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: authTest, error: authError } = await supabase.auth.getSession();
    if (authError && authError.message !== 'No session found') {
      throw authError;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking table structure...');
    
    const tables = ['users', 'projects', 'blockchain_transactions', 'ipfs_storage'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' error:`, error.message);
        } else {
          console.log(`✅ Table '${table}' accessible`);
        }
      } catch (e) {
        console.log(`❌ Table '${table}' not accessible:`, e.message);
      }
    }

    // Test 3: Check projects table schema
    console.log('\n3️⃣ Testing projects table schema...');
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, creator_id, ipfs_hash, blockchain_tx_hash')
        .limit(1);
      
      if (error) {
        console.log('❌ Projects table schema error:', error.message);
      } else {
        console.log('✅ Projects table schema is compatible');
        console.log('Sample fields available:', Object.keys(data[0] || {}));
      }
    } catch (e) {
      console.log('❌ Projects table test failed:', e.message);
    }

    // Test 4: Check ipfs_storage table schema
    console.log('\n4️⃣ Testing ipfs_storage table schema...');
    try {
      const { data, error } = await supabase
        .from('ipfs_storage')
        .select('id, project_id, ipfs_hash, content_type')
        .limit(1);
      
      if (error) {
        console.log('❌ IPFS storage table schema error:', error.message);
      } else {
        console.log('✅ IPFS storage table schema is compatible');
        console.log('Sample fields available:', Object.keys(data[0] || {}));
      }
    } catch (e) {
      console.log('❌ IPFS storage table test failed:', e.message);
    }

    // Test 5: Check blockchain_transactions table schema
    console.log('\n5️⃣ Testing blockchain_transactions table schema...');
    try {
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .select('id, tx_hash, from_address, block_number, status')
        .limit(1);
      
      if (error) {
        console.log('❌ Blockchain transactions table schema error:', error.message);
      } else {
        console.log('✅ Blockchain transactions table schema is compatible');
        console.log('Sample fields available:', Object.keys(data[0] || {}));
      }
    } catch (e) {
      console.log('❌ Blockchain transactions table test failed:', e.message);
    }

    console.log('\n🎉 Supabase connection test completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();