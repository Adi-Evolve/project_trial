// Replay script for project save error scenarios
const { enhancedProjectService } = require('../src/services/enhancedProjectService');
const { localStorageService } = require('../src/services/localStorage');

async function replaySave() {
  console.log('--- Replay: Successful Save ---');
  const dummyProject = {
    title: 'Replay Success Project',
    description: 'Replay test',
    longDescription: 'Replay test long',
    category: 'AI/ML',
    tags: ['replay'],
    demoUrl: '',
    videoUrl: '',
    images: [],
    imageUrls: [],
    fundingGoal: 1000,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    teamSize: 1,
    technologies: ['Replay'],
    features: ['Replay'],
    roadmap: [],
    fundingTiers: [],
    milestones: [],
    creatorId: 'test-uuid',
    creatorName: 'Replay User',
    status: 'active',
  };
  const result = await enhancedProjectService.saveProject(dummyProject);
  console.log('Result:', result);

  console.log('--- Replay: RLS Failure ---');
  const failProject = { ...dummyProject, creatorId: 'bad-uuid', title: 'Replay RLS Fail' };
  const failResult = await enhancedProjectService.saveProject(failProject);
  console.log('Result:', failResult);
}

replaySave().catch(console.error);
