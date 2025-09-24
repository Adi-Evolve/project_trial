import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PhotoIcon,
  UserPlusIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  images: string[];
  team: TeamMember[];
  visibility: 'public' | 'private' | 'unlisted';
  status: 'draft' | 'active' | 'completed' | 'paused';
  fundingGoal?: number;
  currentFunding?: number;
  deadline?: string;
  requirements: string[];
  milestones: Milestone[];
  githubRepo?: string;
  demoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ email: '', role: 'contributor' });
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', dueDate: '' });
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Mock data
  useEffect(() => {
    const mockProject: ProjectData = {
      id: id || '1',
      title: 'AI-Powered Task Manager',
      description: 'Intelligent task management system with ML-based priority suggestions and automated scheduling.',
      longDescription: `## Overview
This project aims to revolutionize task management by incorporating artificial intelligence and machine learning algorithms to help users prioritize and schedule their tasks more effectively.

## Features
- Smart task prioritization using ML algorithms
- Automated scheduling based on deadlines and workload
- Natural language processing for task creation
- Integration with popular calendar applications
- Real-time collaboration features
- Advanced analytics and reporting

## Technical Stack
- Frontend: React, TypeScript, TailwindCSS
- Backend: Node.js, Express, PostgreSQL
- AI/ML: Python, TensorFlow, scikit-learn
- Deployment: Docker, AWS

## Getting Started
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run the development server: \`npm run dev\``,
      category: 'productivity',
      tags: ['AI', 'Machine Learning', 'Productivity', 'Task Management', 'React', 'Node.js'],
      images: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
      ],
      team: [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          role: 'owner',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b563?w=150',
          permissions: ['edit', 'delete', 'manage_team', 'manage_funding']
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          email: 'marcus@example.com',
          role: 'developer',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          permissions: ['edit']
        }
      ],
      visibility: 'public',
      status: 'active',
      fundingGoal: 50000,
      currentFunding: 23750,
      deadline: '2024-06-30',
      requirements: [
        'React.js experience (2+ years)',
        'Node.js and Express knowledge',
        'Machine Learning fundamentals',
        'UI/UX design skills',
        'Database management (PostgreSQL)'
      ],
      milestones: [
        {
          id: '1',
          title: 'MVP Development',
          description: 'Complete core features and basic UI',
          dueDate: '2024-03-15',
          completed: true,
          completedAt: '2024-03-10'
        },
        {
          id: '2',
          title: 'AI Integration',
          description: 'Implement ML algorithms for task prioritization',
          dueDate: '2024-04-30',
          completed: false
        },
        {
          id: '3',
          title: 'Beta Testing',
          description: 'User testing and feedback collection',
          dueDate: '2024-05-31',
          completed: false
        }
      ],
      githubRepo: 'https://github.com/sarahchen/ai-task-manager',
      demoUrl: 'https://ai-task-manager-demo.vercel.app',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z'
    };

    setTimeout(() => {
      setProjectData(mockProject);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSave = async (isDraft = false) => {
    if (!projectData) return;

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProjectData({
        ...projectData,
        status: isDraft ? 'draft' : projectData.status,
        updatedAt: new Date().toISOString()
      });

      toast.success(isDraft ? 'Draft saved successfully!' : 'Project updated successfully!');
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!projectData) return;

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProjectData({
        ...projectData,
        status: 'active',
        updatedAt: new Date().toISOString()
      });

      toast.success('Project published successfully!');
    } catch (error) {
      toast.error('Failed to publish project');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && projectData && !projectData.tags.includes(newTag.trim())) {
      setProjectData({
        ...projectData,
        tags: [...projectData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    if (projectData) {
      setProjectData({
        ...projectData,
        tags: projectData.tags.filter(t => t !== tag)
      });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && projectData) {
      setProjectData({
        ...projectData,
        requirements: [...projectData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    if (projectData) {
      setProjectData({
        ...projectData,
        requirements: projectData.requirements.filter((_, i) => i !== index)
      });
    }
  };

  const addTeamMember = () => {
    if (newTeamMember.email.trim() && projectData) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newTeamMember.email.split('@')[0],
        email: newTeamMember.email,
        role: newTeamMember.role,
        permissions: newTeamMember.role === 'owner' ? ['edit', 'delete', 'manage_team', 'manage_funding'] : ['edit']
      };

      setProjectData({
        ...projectData,
        team: [...projectData.team, member]
      });
      setNewTeamMember({ email: '', role: 'contributor' });
    }
  };

  const removeTeamMember = (memberId: string) => {
    if (projectData) {
      setProjectData({
        ...projectData,
        team: projectData.team.filter(member => member.id !== memberId)
      });
    }
  };

  const addMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.dueDate && projectData) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        completed: false
      };

      setProjectData({
        ...projectData,
        milestones: [...projectData.milestones, milestone]
      });
      setNewMilestone({ title: '', description: '', dueDate: '' });
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    if (projectData) {
      setProjectData({
        ...projectData,
        milestones: projectData.milestones.map(milestone =>
          milestone.id === milestoneId
            ? {
                ...milestone,
                completed: !milestone.completed,
                completedAt: !milestone.completed ? new Date().toISOString() : undefined
              }
            : milestone
        )
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: DocumentTextIcon },
    { id: 'media', label: 'Media', icon: PhotoIcon },
    { id: 'team', label: 'Team', icon: UserPlusIcon },
    { id: 'milestones', label: 'Milestones', icon: CalendarIcon },
    { id: 'funding', label: 'Funding', icon: CurrencyDollarIcon },
    { id: 'settings', label: 'Settings', icon: GlobeAltIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link
            to="/my-projects"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to My Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/projects/${projectData.id}`}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Edit Project
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {projectData.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={projectData.status === 'draft' ? handlePublish : () => handleSave(false)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                <span>
                  {projectData.status === 'draft' ? 'Publish' : 'Save Changes'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Project Status */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status</h3>
              <select
                value={projectData.status}
                onChange={(e) => setProjectData({ ...projectData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {activeTab === 'general' && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={projectData.title}
                      onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Description
                    </label>
                    <textarea
                      rows={3}
                      value={projectData.description}
                      onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Brief description of your project..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description (Markdown supported)
                    </label>
                    <textarea
                      rows={12}
                      value={projectData.longDescription}
                      onChange={(e) => setProjectData({ ...projectData, longDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Detailed project description with markdown formatting..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={projectData.category}
                      onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="technology">Technology</option>
                      <option value="productivity">Productivity</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="environment">Environment</option>
                      <option value="finance">Finance</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {projectData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900 dark:hover:text-blue-200"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements
                    </label>
                    <div className="space-y-2 mb-3">
                      {projectData.requirements.map((requirement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="text-gray-900 dark:text-white">{requirement}</span>
                          <button
                            onClick={() => removeRequirement(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        placeholder="Add a requirement..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={addRequirement}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GitHub Repository
                      </label>
                      <input
                        type="url"
                        value={projectData.githubRepo || ''}
                        onChange={(e) => setProjectData({ ...projectData, githubRepo: e.target.value })}
                        placeholder="https://github.com/username/repo"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Demo URL
                      </label>
                      <input
                        type="url"
                        value={projectData.demoUrl || ''}
                        onChange={(e) => setProjectData({ ...projectData, demoUrl: e.target.value })}
                        placeholder="https://your-demo.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional tabs content would go here */}
              {activeTab !== 'general' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      {activeTab === 'media' && <PhotoIcon className="w-16 h-16 mx-auto" />}
                      {activeTab === 'team' && <UserPlusIcon className="w-16 h-16 mx-auto" />}
                      {activeTab === 'milestones' && <CalendarIcon className="w-16 h-16 mx-auto" />}
                      {activeTab === 'funding' && <CurrencyDollarIcon className="w-16 h-16 mx-auto" />}
                      {activeTab === 'settings' && <GlobeAltIcon className="w-16 h-16 mx-auto" />}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {tabs.find(tab => tab.id === activeTab)?.label} Settings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This section is under development. Basic project editing is available in the General tab.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;