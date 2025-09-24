// Test enhanced project service with actual Supabase
const { enhancedProjectService } = require('./src/services/enhancedProjectService');

async function testProjectCreation() {
  try {
    console.log('🧪 Testing Enhanced Project Service...');

    // Test project data
    const testProject = {
      title: "Test Project - Enhanced Service",
      description: "Testing the enhanced project service with proper Supabase integration",
      longDescription: "This is a comprehensive test of the enhanced project service to ensure IPFS hashes are properly saved to Supabase with the correct schema mapping.",
      creatorId: "test-user-123",
      creatorName: "Test User",
      category: "AI/ML",
      tags: ["test", "enhanced-service", "supabase"],
      demoUrl: "https://example.com/demo",
      videoUrl: "https://youtube.com/watch?v=test",
      imageHashes: ["QmTestHash123", "QmTestHash456"],
      fundingGoal: 10000,
      currentFunding: 0,
      deadline: "2024-12-31",
      teamSize: 3,
      technologies: ["React", "TypeScript", "Supabase"],
      features: ["Enhanced IPFS Integration", "Proper Schema Mapping", "Error Handling"],
      roadmap: [
        {
          id: "1",
          title: "Initial Development",
          description: "Set up enhanced services",
          timeline: "Q1 2024",
          completed: false
        }
      ],
      fundingTiers: [
        {
          id: "1",
          title: "Early Supporter",
          amount: 100,
          description: "Get early access",
          perks: ["Early access"],
          estimatedDelivery: "Q2 2024"
        }
      ],
      milestones: [
        {
          id: "1",
          title: "Alpha Release",
          description: "First working version",
          targetAmount: 5000,
          deadline: "2024-06-30",
          deliverables: ["Working prototype"]
        }
      ],
      ipfsHash: "QmTestProjectMetadata123",
      status: "active"
    };

    console.log('📦 Creating test project...');
    const result = await enhancedProjectService.saveProject(testProject);

    if (result.success) {
      console.log('✅ Project created successfully!');
      console.log('Project ID:', result.project?.id);
      console.log('Supabase ID:', result.supabaseId);

      // Test IPFS hash sync
      if (result.project?.id && result.project?.ipfsHash) {
        console.log('🔄 Testing IPFS hash sync...');
        const syncResult = await enhancedProjectService.syncIPFSHashToSupabase(
          result.project.id,
          result.project.ipfsHash
        );
        
        if (syncResult) {
          console.log('✅ IPFS hash synced successfully!');
        } else {
          console.log('❌ IPFS hash sync failed');
        }
      }

      // Test project update
      if (result.project?.id) {
        console.log('🔄 Testing project update...');
        const updateResult = await enhancedProjectService.updateProject(result.project.id, {
          description: "Updated description with enhanced service",
          currentFunding: 500,
          blockchainTxHash: "0xtest123abc456def789"
        });

        if (updateResult.success) {
          console.log('✅ Project updated successfully!');
        } else {
          console.log('❌ Project update failed:', updateResult.error);
        }
      }

      // Test connection
      console.log('🔍 Testing Supabase connection...');
      const connectionTest = await enhancedProjectService.testSupabaseConnection();
      console.log('Connection result:', connectionTest);

      console.log('🎉 All tests completed successfully!');
      
    } else {
      console.error('❌ Project creation failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProjectCreation();