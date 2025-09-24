// Enhanced error handling test for Supabase operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.log('Required variables:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function analyzeError(error, operation) {
  console.log(`\n🔍 Error Analysis for ${operation}:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Error Code: ${error.code || 'N/A'}`);
  console.log(`Error Message: ${error.message || 'N/A'}`);
  console.log(`Error Details: ${error.details || 'N/A'}`);
  console.log(`Error Hint: ${error.hint || 'N/A'}`);
  
  // Analyze common error patterns
  if (error.code === 'PGRST301') {
    console.log('🔒 Analysis: Row Level Security is blocking this operation');
    console.log('💡 Solution: Check RLS policies or use service role key');
  } else if (error.code === '23505') {
    console.log('🔑 Analysis: Unique constraint violation');
    console.log('💡 Solution: Check for duplicate values in unique fields');
  } else if (error.code === '23503') {
    console.log('🔗 Analysis: Foreign key constraint violation');
    console.log('💡 Solution: Ensure referenced records exist');
  } else if (error.code === 'PGRST116') {
    console.log('🔍 Analysis: No rows found');
    console.log('💡 Solution: Check if the record exists or adjust query');
  } else if (error.message?.includes('JWT')) {
    console.log('🎫 Analysis: Authentication/JWT issue');
    console.log('💡 Solution: Check API keys or authentication status');
  } else if (error.message?.includes('permission')) {
    console.log('🚫 Analysis: Permission denied');
    console.log('💡 Solution: Check user permissions or RLS policies');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function testErrorScenarios() {
  console.log('🧪 Testing Error Scenarios and Enhanced Error Handling\n');
  
  // Test 1: Invalid table name
  console.log('1️⃣ Testing invalid table name...');
  try {
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    if (error) {
      analyzeError(error, 'Invalid Table Access');
    } else {
      console.log('⚠️ Unexpected success for invalid table');
    }
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
  
  // Test 2: Invalid column name
  console.log('2️⃣ Testing invalid column name...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('nonexistent_column')
      .limit(1);
    
    if (error) {
      analyzeError(error, 'Invalid Column Access');
    } else {
      console.log('⚠️ Unexpected success for invalid column');
    }
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
  
  // Test 3: Foreign key constraint violation
  console.log('3️⃣ Testing foreign key constraint violation...');
  try {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase
      .from('contributions')
      .insert([{
        project_id: fakeUUID,
        contributor_id: fakeUUID,
        amount: 0.001,
        currency: 'ETH',
        blockchain_tx_hash: '0xtest' + Date.now(),
        status: 'pending'
      }]);
    
    if (error) {
      analyzeError(error, 'Foreign Key Violation');
    } else {
      console.log('⚠️ Unexpected success for FK violation');
    }
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
  
  // Test 4: Unique constraint violation  
  console.log('4️⃣ Testing unique constraint violation...');
  try {
    // First, try to insert a user
    const testWallet = '0xtest' + Date.now();
    const userData = {
      wallet_address: testWallet,
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      full_name: 'Test User',
      role: 'funder'
    };
    
    const { data: firstUser, error: firstError } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (firstError) {
      analyzeError(firstError, 'Initial User Creation');
    } else if (firstUser && firstUser[0]) {
      console.log('✅ First user created successfully');
      
      // Now try to insert duplicate
      const { data: duplicateUser, error: duplicateError } = await supabase
        .from('users')
        .insert([userData]);
      
      if (duplicateError) {
        analyzeError(duplicateError, 'Duplicate User Creation');
      } else {
        console.log('⚠️ Unexpected success for duplicate user');
      }
      
      // Cleanup
      await supabase.from('users').delete().eq('id', firstUser[0].id);
      console.log('🧹 Cleaned up test user');
    }
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
  
  // Test 5: RLS policy blocking
  console.log('5️⃣ Testing RLS policy restrictions...');
  try {
    // Try to access data that might be blocked by RLS
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      analyzeError(error, 'RLS Policy Check');
    } else {
      console.log('✅ RLS allows this operation or is not configured');
      console.log(`Retrieved ${data.length} records`);
    }
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
}

async function testDataIntegrity() {
  console.log('\n6️⃣ Testing Data Integrity and Validation...');
  
  try {
    // Test invalid data types
    console.log('Testing invalid data types...');
    const { data, error } = await supabase
      .from('users')
      .insert([{
        wallet_address: 'invalid_wallet_address', // Should be 42 chars starting with 0x
        email: 'invalid_email', // Invalid email format
        username: null, // Might be required
        full_name: 'A'.repeat(1000), // Too long
        role: 'invalid_role' // Not in allowed values
      }]);
    
    if (error) {
      analyzeError(error, 'Data Type Validation');
    } else {
      console.log('⚠️ Validation passed unexpectedly');
    }
    
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
}

async function testConnectionIssues() {
  console.log('\n7️⃣ Testing Connection and Network Issues...');
  
  try {
    // Test with invalid credentials
    console.log('Testing with modified credentials...');
    const invalidClient = createClient(supabaseUrl, supabaseKey + 'invalid');
    
    const { data, error } = await invalidClient
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      analyzeError(error, 'Invalid Credentials');
    } else {
      console.log('⚠️ Invalid credentials unexpectedly worked');
    }
    
  } catch (err) {
    console.log('❌ Exception caught:', err.message);
  }
}

async function runErrorHandlingTests() {
  console.log('🚀 Starting Enhanced Error Handling Tests\n');
  
  await testErrorScenarios();
  await testDataIntegrity();
  await testConnectionIssues();
  
  console.log('\n🏁 Error handling test complete!');
  console.log('\n📋 Summary of Common Issues:');
  console.log('- PGRST301: Row Level Security blocking operations');
  console.log('- 23505: Unique constraint violations (duplicate data)');
  console.log('- 23503: Foreign key constraint violations');
  console.log('- PGRST116: No records found');
  console.log('- JWT errors: Authentication issues');
  console.log('- Permission errors: Access control issues');
}

runErrorHandlingTests().catch(console.error);