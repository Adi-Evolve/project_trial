import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  BookmarkIcon,
  TagIcon,
  GlobeAltIcon,
  PlayIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  LinkIcon,
  PencilIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CogIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface ProjectContributor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  contributions: number;
}

interface ProjectTimelineUpdate {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'progress' | 'announcement' | 'launch' | 'feature' | 'issue' | 'funding';
  date: Date;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  attachments?: {
    type: 'image' | 'video' | 'link' | 'document';
    url: string;
    title: string;
  }[];
  metrics?: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  status?: 'completed' | 'in-progress' | 'planned' | 'delayed';
}

interface ProjectFunding {
  goal: number;
  raised: number;
  currency: string;
  backers: number;
  deadline?: Date;
  rewards?: {
    id: string;
    amount: number;
    title: string;
    description: string;
    backers: number;
    estimated_delivery?: Date;
  }[];
}

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  technologies: string[];
  categories: string[];
  stats: {
    stars: number;
    views: number;
    likes: number;
    comments: number;
    supporters: number;
  };
  demo?: {
    url: string;
    screenshots: string[];
    video?: string;
  };
  status: 'concept' | 'development' | 'beta' | 'launched' | 'completed' | 'paused';
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
  timeline: ProjectTimelineUpdate[];
  funding?: ProjectFunding;
  tags: string[];
  featured: boolean;
  team: ProjectContributor[];
  milestones: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: Date;
    completedDate?: Date;
  }[];
}

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'team' | 'funding'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    type: 'progress' as ProjectTimelineUpdate['type'],
    attachments: [] as any[]
  });

  useEffect(() => {
    // Mock project data - in real app, fetch from API
    const mockProject: ProjectDetails = {
      id: projectId || '1',
      title: 'AI-Powered Code Assistant',
      description: 'An intelligent code completion and debugging tool powered by machine learning',
      longDescription: `This project represents a cutting-edge AI-powered development tool that revolutionizes how developers write, debug, and maintain code. 

## Vision & Mission
Our mission is to democratize AI-assisted programming and make advanced coding tools accessible to developers worldwide. We believe that intelligent code assistance should be intuitive, fast, and seamlessly integrated into every developer's workflow.

## Key Features
- **Intelligent Code Completion**: Advanced ML models provide context-aware suggestions
- **Automated Bug Detection**: Real-time analysis identifies potential issues before runtime  
- **Performance Optimization**: AI recommendations for code efficiency improvements
- **Multi-Language Support**: Works with JavaScript, Python, Java, C++, and more
- **Team Collaboration**: Built-in features for code review and pair programming

## Technical Innovation
The system uses a combination of transformer-based models and static analysis to provide intelligent assistance. Our proprietary algorithm processes millions of code patterns to deliver contextually relevant suggestions with 95% accuracy.

## Impact & Results
Since launch, the tool has helped over 10,000 developers improve their coding efficiency by an average of 35%. The bug detection feature has prevented over 50,000 potential runtime errors, saving countless hours of debugging time.

## Future Roadmap
We're continuously evolving with plans for advanced AI pair programming, automated testing generation, and integration with popular IDEs and cloud platforms.`,
      author: {
        id: 'user-1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        username: 'sarahdev'
      },
      technologies: ['React', 'TypeScript', 'Node.js', 'TensorFlow', 'PostgreSQL', 'Redis', 'Docker'],
      categories: ['AI/ML', 'Developer Tools', 'Productivity'],
      stats: {
        stars: 2847,
        views: 15623,
        likes: 1891,
        comments: 156,
        supporters: 342
      },
      demo: {
        url: 'https://ai-code-assistant-demo.vercel.app',
        video: 'https://sample-videos.com/zip/10/mp4/mp4sample.mp4',
        screenshots: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=400&fit=crop'
        ]
      },
      status: 'development',
      visibility: 'public',
      createdAt: new Date(2024, 0, 15),
      updatedAt: new Date(),
      timeline: [
        {
          id: 'update-8',
          title: 'Beta Testing Phase Complete',
          description: 'Successfully completed beta testing with 500+ developers. Received valuable feedback and implemented major improvements to the ML model accuracy.',
          type: 'milestone',
          date: new Date(2024, 1, 15),
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          metrics: [
            { label: 'Beta Users', value: 523 },
            { label: 'Bug Reports', value: 89 },
            { label: 'Feature Requests', value: 156 },
            { label: 'Overall Rating', value: '4.7/5' }
          ],
          status: 'completed'
        },
        {
          id: 'update-7',
          title: 'Major Algorithm Breakthrough',
          description: 'Our team achieved a significant breakthrough in the ML algorithm, improving code suggestion accuracy from 87% to 95%. This puts us ahead of industry standards.',
          type: 'progress',
          date: new Date(2024, 1, 8),
          author: {
            id: 'user-2',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
          },
          attachments: [
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
              title: 'Algorithm Performance Chart'
            }
          ],
          metrics: [
            { label: 'Accuracy Improvement', value: '+8%', change: 'up' },
            { label: 'Response Time', value: '120ms', change: 'down' },
            { label: 'Memory Usage', value: '-15%', change: 'down' }
          ],
          status: 'completed'
        },
        {
          id: 'update-6',
          title: 'Partnership with TechCorp',
          description: 'Excited to announce our strategic partnership with TechCorp for enterprise integration. This will help us reach thousands of enterprise developers.',
          type: 'announcement',
          date: new Date(2024, 1, 1),
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          attachments: [
            {
              type: 'link',
              url: 'https://techcorp.com/partnership-announcement',
              title: 'Official Partnership Announcement'
            }
          ],
          status: 'completed'
        },
        {
          id: 'update-5',
          title: 'Series A Funding Complete',
          description: 'Successfully raised $2.5M in Series A funding! This will accelerate our development and help us build the best AI coding assistant in the market.',
          type: 'funding',
          date: new Date(2024, 0, 20),
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          metrics: [
            { label: 'Amount Raised', value: '$2.5M' },
            { label: 'Lead Investor', value: 'TechVentures' },
            { label: 'Team Growth', value: '+12 members' }
          ],
          status: 'completed'
        },
        {
          id: 'update-4',
          title: 'Multi-Language Support Added',
          description: 'Added support for Python, Java, and C++. Our AI model can now provide intelligent suggestions across multiple programming languages.',
          type: 'feature',
          date: new Date(2024, 0, 10),
          author: {
            id: 'user-3',
            name: 'Emily Watson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
          },
          attachments: [
            {
              type: 'video',
              url: 'https://sample-videos.com/zip/10/mp4/mp4sample.mp4',
              title: 'Multi-Language Demo'
            }
          ],
          status: 'completed'
        },
        {
          id: 'update-3',
          title: 'Alpha Version Released',
          description: 'Released the first alpha version to our early supporters. Getting great feedback from the developer community!',
          type: 'launch',
          date: new Date(2023, 11, 15),
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          metrics: [
            { label: 'Downloads', value: 1250 },
            { label: 'Active Users', value: 340 },
            { label: 'Feedback Score', value: '4.2/5' }
          ],
          status: 'completed'
        },
        {
          id: 'update-2',
          title: 'Core ML Model Training Complete',
          description: 'Finished training our core machine learning model on millions of code samples. Initial testing shows promising results!',
          type: 'milestone',
          date: new Date(2023, 10, 1),
          author: {
            id: 'user-2',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
          },
          status: 'completed'
        },
        {
          id: 'update-1',
          title: 'Project Kickoff',
          description: 'Started development of the AI-Powered Code Assistant. Our goal is to revolutionize how developers write and debug code.',
          type: 'milestone',
          date: new Date(2023, 8, 1),
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          status: 'completed'
        }
      ],
      funding: {
        goal: 5000000,
        raised: 2500000,
        currency: 'USD',
        backers: 342,
        deadline: new Date(2024, 5, 1),
        rewards: [
          {
            id: 'reward-1',
            amount: 25,
            title: 'Early Access',
            description: 'Get early access to all features + exclusive Discord community',
            backers: 156,
            estimated_delivery: new Date(2024, 3, 1)
          },
          {
            id: 'reward-2',
            amount: 100,
            title: 'Pro License',
            description: 'Lifetime Pro license + early access + 1-on-1 onboarding session',
            backers: 89,
            estimated_delivery: new Date(2024, 3, 15)
          },
          {
            id: 'reward-3',
            amount: 500,
            title: 'Enterprise Package',
            description: 'Enterprise license + custom integrations + priority support',
            backers: 23,
            estimated_delivery: new Date(2024, 4, 1)
          }
        ]
      },
      tags: ['ai', 'productivity', 'developer-tools', 'machine-learning', 'code-completion'],
      featured: true,
      team: [
        {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          role: 'Founder & CEO',
          contributions: 487
        },
        {
          id: 'user-2',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
          role: 'CTO & ML Engineer',
          contributions: 298
        },
        {
          id: 'user-3',
          name: 'Emily Watson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          role: 'Lead Frontend Developer',
          contributions: 176
        },
        {
          id: 'user-4',
          name: 'Michael Kim',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          role: 'Backend Developer',
          contributions: 234
        }
      ],
      milestones: [
        {
          id: 'milestone-1',
          title: 'MVP Development',
          description: 'Build the minimum viable product with core AI features',
          completed: true,
          completedDate: new Date(2023, 11, 15)
        },
        {
          id: 'milestone-2',
          title: 'Beta Release',
          description: 'Launch beta version for community testing',
          completed: true,
          completedDate: new Date(2024, 1, 15)
        },
        {
          id: 'milestone-3',
          title: 'Enterprise Features',
          description: 'Add enterprise-grade features and security',
          completed: false,
          dueDate: new Date(2024, 3, 1)
        },
        {
          id: 'milestone-4',
          title: 'Public Launch',
          description: 'Official public launch with marketing campaign',
          completed: false,
          dueDate: new Date(2024, 5, 1)
        }
      ]
    };

    setTimeout(() => {
      setProject(mockProject);
      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  const handleAction = (action: string) => {
    switch (action) {
      case 'star':
        setIsStarred(!isStarred);
        toast.success(isStarred ? 'Unstarred project' : 'Starred project!');
        break;
      case 'like':
        setIsLiked(!isLiked);
        toast.success(isLiked ? 'Unliked project' : 'Liked project!');
        break;
      case 'bookmark':
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? 'Removed bookmark' : 'Bookmarked project!');
        break;
      case 'share':
        navigator.clipboard.writeText(window.location.href);
        toast.success('Project link copied to clipboard!');
        break;
    }
  };

  const handleAddUpdate = () => {
    if (!newUpdate.title || !newUpdate.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const update: ProjectTimelineUpdate = {
      id: `update-${Date.now()}`,
      title: newUpdate.title,
      description: newUpdate.description,
      type: newUpdate.type,
      date: new Date(),
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      status: 'completed'
    };

    if (project) {
      setProject({
        ...project,
        timeline: [update, ...project.timeline]
      });
    }

    setNewUpdate({
      title: '',
      description: '',
      type: 'progress',
      attachments: []
    });
    setShowUpdateForm(false);
    toast.success('Project update added successfully!');
  };

  const getTimelineIcon = (type: ProjectTimelineUpdate['type']) => {
    switch (type) {
      case 'milestone': return CheckCircleIcon;
      case 'progress': return CogIcon;
      case 'announcement': return InformationCircleIcon;
      case 'launch': return RocketLaunchIcon;
      case 'feature': return LightBulbIcon;
      case 'funding': return CurrencyDollarIcon;
      case 'issue': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getTimelineColor = (type: ProjectTimelineUpdate['type']) => {
    switch (type) {
      case 'milestone': return 'bg-green-500 text-white';
      case 'progress': return 'bg-blue-500 text-white';
      case 'announcement': return 'bg-purple-500 text-white';
      case 'launch': return 'bg-orange-500 text-white';
      case 'feature': return 'bg-yellow-500 text-white';
      case 'funding': return 'bg-green-600 text-white';
      case 'issue': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'text-purple-400 bg-purple-500/20';
      case 'development': return 'text-blue-400 bg-blue-500/20';
      case 'beta': return 'text-yellow-400 bg-yellow-500/20';
      case 'launched': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/20';
      case 'paused': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Project Details</h3>
          <p className="text-gray-600">Please wait while we fetch the project information...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
    { id: 'team', name: 'Team', icon: UserGroupIcon },
    { id: 'funding', name: 'Funding', icon: CurrencyDollarIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('star')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isStarred ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
                }`}
              >
                {isStarred ? <StarSolidIcon className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
                <span>{project.stats.stars + (isStarred ? 1 : 0)}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('like')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
                }`}
              >
                {isLiked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                <span>{project.stats.likes + (isLiked ? 1 : 0)}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('bookmark')}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
                }`}
              >
                {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('share')}
                className="p-2 bg-white text-gray-600 hover:text-gray-900 rounded-lg transition-colors border border-gray-200"
              >
                <ShareIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Project Header */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-start space-x-6">
              <img
                src={project.author.avatar}
                alt={project.author.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                  {project.featured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-lg mb-4">{project.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <img
                      src={project.author.avatar}
                      alt={project.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>by <span className="text-gray-900 font-medium">{project.author.name}</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Created {project.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Updated {project.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                {project.demo && (
                  <motion.a
                    href={project.demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Live Demo</span>
                  </motion.a>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/projects/${project.id}/fund`)}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span>Fund Project</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{project.stats.stars}</div>
            <div className="text-sm text-gray-500">Stars</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{project.stats.views}</div>
            <div className="text-sm text-gray-500">Views</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{project.stats.likes}</div>
            <div className="text-sm text-gray-500">Likes</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{project.stats.supporters}</div>
            <div className="text-sm text-gray-500">Supporters</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{project.team.length}</div>
            <div className="text-sm text-gray-500">Team Members</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">About This Project</h3>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {project.longDescription}
                      </div>
                    </div>
                  </div>

                  {/* Screenshots */}
                  {project.demo?.screenshots && (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Screenshots</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.demo.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="rounded-xl object-cover aspect-video border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Milestones</h3>
                    <div className="space-y-4">
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className={`p-2 rounded-lg ${milestone.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {milestone.completed ? <CheckCircleSolidIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 font-semibold">{milestone.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {milestone.completed && milestone.completedDate && (
                                <span>Completed: {milestone.completedDate.toLocaleDateString()}</span>
                              )}
                              {!milestone.completed && milestone.dueDate && (
                                <span>Due: {milestone.dueDate.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            milestone.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {milestone.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Technologies */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {project.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm mr-2"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Project Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className="text-gray-900 capitalize">{project.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibility</span>
                        <span className="text-gray-900 capitalize">{project.visibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created</span>
                        <span className="text-gray-900">{project.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="text-gray-900">{project.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Preview */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Team</h3>
                    <div className="space-y-3">
                      {project.team.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border border-gray-200"
                          />
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.role}</div>
                          </div>
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <button
                          onClick={() => setActiveTab('team')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View all {project.team.length} members →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6">
                {/* Add Update Button - Only for project owners */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Project Timeline</h2>
                  {/* For now, assuming current user ID is 'user-1' - in real app, this would come from auth context */}
                  {project.author.id === 'user-1' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUpdateForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Update</span>
                    </motion.button>
                  )}
                </div>

                {/* Add Update Form */}
                <AnimatePresence>
                  {showUpdateForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Add Project Update</h3>
                        <button
                          onClick={() => setShowUpdateForm(false)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Title</label>
                          <input
                            type="text"
                            value={newUpdate.title}
                            onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter update title..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                          <select
                            value={newUpdate.type}
                            onChange={(e) => setNewUpdate({...newUpdate, type: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="progress">Progress Update</option>
                            <option value="milestone">Milestone</option>
                            <option value="announcement">Announcement</option>
                            <option value="launch">Launch</option>
                            <option value="feature">New Feature</option>
                            <option value="funding">Funding News</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={newUpdate.description}
                            onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                            placeholder="Describe your update..."
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleAddUpdate}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add Update
                          </button>
                          <button
                            onClick={() => setShowUpdateForm(false)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timeline */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-8">
                      {project.timeline.map((update, index) => {
                        const TimelineIcon = getTimelineIcon(update.type);
                        return (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start space-x-6"
                          >
                            {/* Timeline Icon */}
                            <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${getTimelineColor(update.type)} shadow-lg`}>
                              <TimelineIcon className="w-8 h-8" />
                            </div>
                            
                            {/* Timeline Content */}
                            <div className="flex-1 bg-gray-50 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{update.title}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src={update.author.avatar}
                                        alt={update.author.name}
                                        className="w-5 h-5 rounded-full"
                                      />
                                      <span>{update.author.name}</span>
                                    </div>
                                    <span>{update.date.toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTimelineColor(update.type).replace('text-white', 'text-current')}`}>
                                      {update.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4">{update.description}</p>
                              
                              {/* Metrics */}
                              {update.metrics && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  {update.metrics.map((metric, i) => (
                                    <div key={i} className="bg-white rounded-lg p-3 text-center border border-gray-200">
                                      <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                                      <div className="text-xs text-gray-500">{metric.label}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Attachments */}
                              {update.attachments && update.attachments.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {update.attachments.map((attachment, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                                      <div className="flex items-center space-x-3">
                                        {attachment.type === 'image' && <PhotoIcon className="w-5 h-5 text-blue-500" />}
                                        {attachment.type === 'link' && <LinkIcon className="w-5 h-5 text-green-500" />}
                                        {attachment.type === 'video' && <PlayIcon className="w-5 h-5 text-red-500" />}
                                        <div>
                                          <p className="font-medium text-gray-900">{attachment.title}</p>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                          >
                                            View {attachment.type}
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.team.map((member) => (
                    <div key={member.id} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-gray-200"
                      />
                      <h4 className="text-gray-900 font-bold text-lg">{member.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                      <p className="text-blue-600 font-medium">{member.contributions} contributions</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'funding' && project.funding && (
              <div className="space-y-6">
                {/* Funding Progress */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Funding Progress</h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-gray-900">
                        ${(project.funding.raised / 1000000).toFixed(1)}M / ${(project.funding.goal / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((project.funding.raised / project.funding.goal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>{Math.round((project.funding.raised / project.funding.goal) * 100)}% funded</span>
                      <span>{project.funding.backers} backers</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(project.funding.raised / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-gray-600">Raised</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{project.funding.backers}</div>
                      <div className="text-gray-600">Backers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {project.funding.deadline ? Math.ceil((project.funding.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      </div>
                      <div className="text-gray-600">Days left</div>
                    </div>
                  </div>
                </div>

                {/* Funding Rewards */}
                {project.funding.rewards && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Funding Rewards</h3>
                    <div className="space-y-4">
                      {project.funding.rewards.map((reward) => (
                        <div key={reward.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">${reward.amount}</h4>
                              <h5 className="text-blue-600 font-semibold">{reward.title}</h5>
                            </div>
                            <span className="text-sm text-gray-500">{reward.backers} backers</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                          {reward.estimated_delivery && (
                            <p className="text-xs text-gray-500">
                              Estimated delivery: {reward.estimated_delivery.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;