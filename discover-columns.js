// Quick Column Name Discovery
// Find exact column names by testing inserts

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function discoverColumns(tableName, testData) {
  console.log(`\n📋 Discovering columns for ${tableName}:`);
  
  // Try inserting with minimal data to see what's required/available
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(testData)
      .select();
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      
      // Parse error for column information
      if (error.message.includes('Could not find the')) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        if (match) {
          console.log(`  🔍 Column '${match[1]}' does not exist`);
        }
      }
    } else {
      console.log(`  ✅ Success! Data inserted`);
      if (data && data.length > 0) {
        console.log(`  📊 Available columns:`, Object.keys(data[0]).join(', '));
      }
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
}

async function findCorrectColumns() {
  console.log('🔍 DISCOVERING CORRECT COLUMN NAMES');
  console.log('='.repeat(40));
  
  // Test blockchain_transactions
  await discoverColumns('blockchain_transactions', {
    id: crypto.randomUUID(),
    tx_hash: '0x123...',
    transaction_type: 'contribution',
    status: 'confirmed'
  });
  
  // Test with different column name
  await discoverColumns('blockchain_transactions', {
    id: crypto.randomUUID(),
    transaction_hash: '0x123...',
    type: 'contribution',
    status: 'confirmed'
  });
  
  // Test contributions  
  await discoverColumns('contributions', {
    id: crypto.randomUUID(),
    amount: 0.1,
    currency: 'ETH'
  });
  
  // Test with different column names
  await discoverColumns('contributions', {
    id: crypto.randomUUID(),
    contributor_id: '6cc68b08-db0a-461e-9c0f-5173c4d64b17',
    project_id: 'fbc72633-58b5-4ded-b890-9ef0bfbd4618',
    amount: 0.1
  });
}

// Run discovery
findCorrectColumns().catch(console.error);