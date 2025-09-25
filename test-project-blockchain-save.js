// Test Project Creation and Blockchain Hash Saving
const { createClient } = require('@supabase/supabase-js');

// Hardcoded values for testing (replace with your actual values)
const supabaseUrl = 'https://pgfzweufsurcngnhegvu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZnp3ZXVmc3VyY25nbmhlZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzNDg3MTgsImV4cCI6MjA0MTkyNDcxOH0.5lrP5UzO9BQIPJ6gWXBYozgjGlXIMU7VhS3-bfJHKUg';
const supabase = createClient(supabaseUrl, anonKey);

async function testProjectBlockchainSave() {
  console.log('🧪 TESTING PROJECT CREATION WITH BLOCKCHAIN HASH...');
  console.log('='.repeat(60));

  const testProjectId = 'project_test_' + Date.now() + '_abc123';
  const userId = '6cc68b08-db0a-461e-9c0f-5173c4d64b17';
  const mockBlockchainTxHash = '0xtest' + crypto.randomUUID().replace(/-/g, '') + Date.now().toString().substring(8);

  console.log('📝 Test parameters:');
  console.log('   Project ID:', testProjectId);
  console.log('   User ID:', userId);
  console.log('   Blockchain TX:', mockBlockchainTxHash);

  // Step 1: Create project data (similar to what CreateProjectPage creates)
  console.log('\n🏗️ Step 1: Creating project in Supabase...');
  
  const projectData = {
    title: testProjectId, // Use project ID as title for lookup
    description: 'Test project to verify blockchain hash saving',
    creator_id: userId,
    category: 'Technology',
    funding_goal: 100,
    current_funding: 0,
    currency: 'ETH',
    status: 'active',
    blockchain_tx_hash: mockBlockchainTxHash, // Include blockchain hash
    featured: false,
    total_backers: 0,
    view_count: 0,
    like_count: 0,
    comment_count: 0
  };

  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (createError) {
    console.error('❌ Project creation failed:', createError.message);
    return;
  }

  console.log('✅ Project created successfully!');
  console.log('🆔 Supabase UUID:', newProject.id);
  console.log('🔗 Blockchain hash:', newProject.blockchain_tx_hash);

  // Step 2: Test project lookup (what contributionsService does)
  console.log('\n🔍 Step 2: Testing project lookup for donations...');

  // Test direct UUID lookup (should fail for blockchain project ID)
  const { data: uuidLookup } = await supabase
    .from('projects')
    .select('id, blockchain_tx_hash')
    .eq('id', testProjectId)
    .single();

  // Test title lookup (should succeed)
  const { data: titleLookup } = await supabase
    .from('projects')
    .select('id, blockchain_tx_hash')
    .eq('title', testProjectId)
    .single();

  console.log('📊 Lookup results:');
  console.log('   UUID lookup:', uuidLookup ? '✅ Found' : '❌ Not found (expected)');
  console.log('   Title lookup:', titleLookup ? '✅ Found' : '❌ Not found');
  
  if (titleLookup) {
    console.log('   Found project UUID:', titleLookup.id);
    console.log('   Blockchain hash:', titleLookup.blockchain_tx_hash);
  }

  // Step 3: Test contribution creation (what happens during donation)
  console.log('\n💰 Step 3: Testing contribution creation...');

  const contributionData = {
    id: crypto.randomUUID(),
    project_id: titleLookup.id, // Use the found UUID
    contributor_id: userId,
    amount: 0.05,
    currency: 'ETH',
    blockchain_tx_hash: '0xdonation' + crypto.randomUUID().replace(/-/g, ''),
    status: 'confirmed',
    contribution_message: 'Test donation for blockchain project',
    is_anonymous: false
  };

  const { data: contribution, error: contributionError } = await supabase
    .from('contributions')
    .insert([contributionData])
    .select()
    .single();

  if (contributionError) {
    console.error('❌ Contribution creation failed:', contributionError.message);
  } else {
    console.log('✅ Contribution created successfully!');
    console.log('💰 Contribution ID:', contribution.id);
    console.log('🔗 Donation TX hash:', contribution.blockchain_tx_hash);
  }

  // Step 4: Verify complete flow
  console.log('\n✅ Step 4: Verification complete!');
  
  if (titleLookup && titleLookup.blockchain_tx_hash && contribution) {
    console.log('\n🎉 SUCCESS! Complete flow working:');
    console.log('   ✅ Project created with blockchain hash');
    console.log('   ✅ Project can be found by title/ID');
    console.log('   ✅ Donations can be saved');
    console.log('   ✅ Both project and donation have blockchain hashes');
  } else {
    console.log('\n❌ ISSUES DETECTED:');
    if (!titleLookup) console.log('   - Project lookup failed');
    if (!titleLookup?.blockchain_tx_hash) console.log('   - Blockchain hash not saved');
    if (!contribution) console.log('   - Donation creation failed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏆 TEST RESULTS SUMMARY:');
  console.log('✅ Project creation:', !!newProject);
  console.log('✅ Blockchain hash saved:', !!newProject?.blockchain_tx_hash);
  console.log('✅ Project lookup:', !!titleLookup);
  console.log('✅ Donation creation:', !!contribution);
  console.log('✅ Complete flow:', !!(titleLookup && contribution && newProject?.blockchain_tx_hash));
}

testProjectBlockchainSave().catch(console.error);