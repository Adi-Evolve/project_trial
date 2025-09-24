// Check Supabase Table Schemas
// This will show us the actual column structure of our tables

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function getTableSchema(tableName) {
  console.log(`\n📋 ${tableName.toUpperCase()} Table Schema:`);
  
  try {
    // Get table columns using information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      return;
    }
    
    if (data.length === 0) {
      console.log(`  ⚠️  Table '${tableName}' not found`);
      return;
    }
    
    data.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const defaultVal = col.column_default ? `default: ${col.column_default}` : '';
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable} ${defaultVal}`);
    });
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }
}

async function checkAllSchemas() {
  console.log('🔍 CHECKING SUPABASE TABLE SCHEMAS');
  console.log('='.repeat(50));
  
  const tables = [
    'users',
    'projects', 
    'contributions',
    'blockchain_transactions',
    'chats',
    'chat_messages',
    'ideas',
    'notifications'
  ];
  
  for (const table of tables) {
    await getTableSchema(table);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Schema check complete!');
}

// Run the schema check
checkAllSchemas().catch(console.error);