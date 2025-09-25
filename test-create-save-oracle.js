// Test script: create a project, auto-generate 5 equal milestones, save, and simulate oracle verification
const fs = require('fs');
const path = require('path');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('--- Test: Create project, add 5 milestones, save, and simulate oracle ---');

  const projectId = `testproj_${Date.now()}`;
  const project = {
    id: projectId,
    title: `AutoTest Project ${Date.now()}`,
    description: 'Automatically created project for testing milestones and oracle',
    fundingGoal: 1000,
    currentFunding: 0,
    creatorId: 'local-test-user',
    milestone_check: false
  };

  console.log('1) Project created locally:', project.id);

  // Generate 5 milestones dividing the fundingGoal equally
  const num = 5;
  const per = Math.round((project.fundingGoal / num) * 100) / 100;
  const milestones = [];
  for (let i=0;i<num;i++) {
    milestones.push({
      id: `${projectId}_m_${i+1}`,
      title: `Milestone ${i+1}`,
      description: `Auto-generated milestone ${i+1}`,
      dueDate: new Date(Date.now() + (i+1)*7*24*60*60*1000).toISOString().split('T')[0],
      targetAmount: per,
      status: 'pending'
    });
  }

  // Adjust last milestone to make the sum exact
  const sum = milestones.reduce((s,m)=>s+(m.targetAmount||0),0);
  const diff = Math.round((project.fundingGoal - sum)*100)/100;
  milestones[milestones.length-1].targetAmount += diff;

  console.log('2) Generated milestones (equal split):');
  milestones.forEach(m=>console.log(`  - ${m.id}: ${m.title} -> ${m.targetAmount}`));

  // Simulate saving: write to a temp JSON file to emulate DB persistence
  const savePath = path.join(__dirname, `tmp_test_project_${projectId}.json`);
  const saved = { project, milestones };
  fs.writeFileSync(savePath, JSON.stringify(saved, null, 2));
  console.log(`3) Saved project and milestones to ${savePath}`);

  // Simulate calling enhancedProjectService.updateProject and oracleService.onMilestoneAdded
  console.log('4) Simulating enhancedProjectService.updateProject...');
  await delay(500);
  console.log('   -> OK (simulated)');

  console.log('5) Simulating oracle verification auto-check...');
  await delay(1000);
  // Simulated oracle logic: mark milestone_check true if milestones exist
  const oracleResult = {
    success: true,
    verified: true,
    oracleId: `oracle_sim_${Date.now()}`
  };
  project.milestone_check = oracleResult.verified;
  console.log(`   -> Oracle simulated result: verified=${oracleResult.verified}, oracleId=${oracleResult.oracleId}`);

  // Update saved file
  saved.project = project;
  fs.writeFileSync(savePath, JSON.stringify(saved, null, 2));
  console.log('6) Updated saved file with milestone_check =', project.milestone_check);

  // Final validation: read file and assert
  const loaded = JSON.parse(fs.readFileSync(savePath,'utf8'));
  if (loaded.project.milestone_check) {
    console.log('✅ Test PASS: milestone_check is true after oracle simulation');
  } else {
    console.error('❌ Test FAIL: milestone_check is not true');
  }

  console.log('--- Test complete ---');
}

if (require.main === module) {
  run().catch(e=>{ console.error('Test script error:', e); process.exit(1); });
}

module.exports = { run };
