// Test user registration and data saving
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserOperations() {
  console.log('🧪 Testing User Operations...\n');
  
  const testWalletAddress = '0x' + Math.random().toString(16).substr(2, 40);
  const testUserData = {
    wallet_address: testWalletAddress,
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    full_name: 'Test User for Database',
    role: 'funder',
    bio: 'Test user created for database testing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    // Test 1: Insert user
    console.log('1️⃣ Testing user insertion...');
    console.log('Inserting user data:', JSON.stringify(testUserData, null, 2));
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUserData])
      .select();
    
    if (insertError) {
      console.error('❌ User insertion failed:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return null;
    }
    
    console.log('✅ User inserted successfully!');
    console.log('Inserted user:', insertData[0]);
    
    const userId = insertData[0].id;
    
    // Test 2: Retrieve user
    console.log('\n2️⃣ Testing user retrieval...');
    const { data: retrieveData, error: retrieveError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (retrieveError) {
      console.error('❌ User retrieval failed:', retrieveError);
    } else {
      console.log('✅ User retrieved successfully!');
      console.log('Retrieved user:', retrieveData);
    }
    
    // Test 3: Update user
    console.log('\n3️⃣ Testing user update...');
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ bio: 'Updated bio for test user', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();
    
    if (updateError) {
      console.error('❌ User update failed:', updateError);
    } else {
      console.log('✅ User updated successfully!');
      console.log('Updated user:', updateData[0]);
    }
    
    // Test 4: Check wallet address retrieval
    console.log('\n4️⃣ Testing wallet address lookup...');
    const { data: walletData, error: walletError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', testWalletAddress)
      .single();
    
    if (walletError) {
      console.error('❌ Wallet lookup failed:', walletError);
    } else {
      console.log('✅ Wallet lookup successful!');
      console.log('Found user by wallet:', walletData);
    }
    
    return userId;
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return null;
  }
}

async function cleanupTestUser(userId) {
  if (!userId) return;
  
  try {
    console.log('\n🧹 Cleaning up test user...');
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Cleanup failed:', error);
    } else {
      console.log('✅ Test user cleaned up successfully!');
    }
  } catch (error) {
    console.error('❌ Cleanup exception:', error);
  }
}

async function runUserTests() {
  console.log('🚀 Starting User Database Tests\n');
  
  const userId = await testUserOperations();
  await cleanupTestUser(userId);
  
  console.log('\n🏁 User test complete!');
}

runUserTests().catch(console.error);