import { enhancedProjectService } from '../services/enhancedProjectService';
import { localStorageService } from '../services/localStorage';

describe('Project Save Path', () => {
  it('should save a project to localStorage and Supabase', async () => {
    const dummyProject = {
      title: 'Test Project',
      description: 'A test project',
      longDescription: 'Detailed description',
      category: 'AI/ML',
      tags: ['test', 'ai'],
      demoUrl: '',
      videoUrl: '',
      images: [],
      imageUrls: [],
      fundingGoal: 1000,
      currentFunding: 0,
      deadline: new Date(Date.now() + 86400000).toISOString(),
      teamSize: 1,
      technologies: ['React'],
      features: ['Testing'],
      roadmap: [],
      fundingTiers: [],
      milestones: [],
      creatorId: 'test-uuid',
      creatorName: 'Test User',
  status: 'active' as const,
    };
    const result = await enhancedProjectService.saveProject(dummyProject);
    expect(result.success).toBe(true);
    expect(result.project).toBeDefined();
    expect(result.supabaseId).toBeDefined();
  });

  it('should fail if Supabase rejects the insert', async () => {
    // Use a project with a bad creatorId to trigger RLS failure
    const dummyProject = {
      ...localStorageService.getAllProjects()[0],
      creatorId: 'bad-uuid',
      title: 'RLS Fail Project',
    };
    const result = await enhancedProjectService.saveProject(dummyProject);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Database sync failed/);
  });
});
