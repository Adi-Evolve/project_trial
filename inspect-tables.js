// Check Table Schemas by Selecting Data
// This will show us actual column names and sample data

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function inspectTable(tableName) {
  console.log(`\n📋 ${tableName.toUpperCase()} Table:`);
  
  try {
    // Try to get one record to see the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ Error: ${error.message} (Code: ${error.code})`);
      return;
    }
    
    if (data.length === 0) {
      console.log(`  📝 Table exists but is empty`);
      
      // Try inserting minimal data to see what's required
      console.log(`  🧪 Testing minimal insert to discover required fields...`);
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({});
      
      if (insertError) {
        console.log(`  🔍 Insert error reveals: ${insertError.message}`);
      }
    } else {
      console.log(`  ✅ Has ${data.length} record(s)`);
      console.log(`  📊 Columns:`, Object.keys(data[0]).join(', '));
      
      // Show a sample record structure
      const sampleRecord = data[0];
      console.log(`  📄 Sample record structure:`);
      Object.entries(sampleRecord).forEach(([key, value]) => {
        const type = value === null ? 'null' : typeof value;
        const preview = value === null ? 'null' : 
                       typeof value === 'string' ? `"${String(value).substring(0, 20)}${value.length > 20 ? '...' : ''}"` :
                       String(value);
        console.log(`    - ${key}: ${type} = ${preview}`);
      });
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
}

async function testSimpleInserts() {
  console.log('\n🧪 TESTING SIMPLE INSERTS:');
  console.log('='.repeat(30));
  
  // Test users table with minimal data
  console.log('\n👤 Testing Users Insert:');
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        wallet_address: '0xbc96a75605fee7614b77877d9871a77ca9e7e022',
        username: 'testuser_' + Date.now()
      })
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`  ✅ Success! User ID: ${data[0].id}`);
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
  
  // Test blockchain_transactions with minimal data
  console.log('\n💰 Testing Blockchain Transactions Insert:');
  try {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .insert({
        id: crypto.randomUUID(),
        transaction_hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
        transaction_type: 'contribution',
        status: 'confirmed'
      })
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`  ✅ Success! Transaction: ${data[0].transaction_hash}`);
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
  
  // Test chats with minimal data
  console.log('\n💬 Testing Chats Insert:');
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        id: crypto.randomUUID(),
        name: 'Test Chat',
        type: 'project'  // Adding type as it was mentioned as required
      })
      .select();
    
    if (error) {
      console.log(`  ❌ Failed: ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`  ✅ Success! Chat ID: ${data[0].id}`);
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
}

async function runInspection() {
  console.log('🔍 SUPABASE TABLE INSPECTION');
  console.log('='.repeat(50));
  
  const tables = [
    'users',
    'projects', 
    'contributions',
    'blockchain_transactions',
    'chats',
    'chat_messages'
  ];
  
  for (const table of tables) {
    await inspectTable(table);
  }
  
  await testSimpleInserts();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Inspection complete!');
}

// Run the inspection
runInspection().catch(console.error);