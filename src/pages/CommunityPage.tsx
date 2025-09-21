import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowUpIcon,
  BookOpenIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  UsersIcon,
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupSolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    reputation: number;
    badges: string[];
  };
  category: string;
  tags: string[];
  createdAt: string;
  metrics: {
    views: number;
    likes: number;
    replies: number;
    upvotes: number;
  };
  isPinned: boolean;
  isHot: boolean;
  lastActivity: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  title: string;
  reputation: number;
  contributions: number;
  verified: boolean;
  badges: string[];
  joinedAt: string;
  isOnline: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'hackathon' | 'meetup';
  startTime: string;
  duration: number;
  attendees: number;
  maxAttendees: number;
  host: {
    name: string;
    avatar: string;
  };
  status: 'upcoming' | 'live' | 'ended';
}

interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  banner?: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  creator: {
    name: string;
    avatar: string;
  };
  moderators: string[];
  createdAt: string;
  tags: string[];
  rules: string[];
}

interface CreateCommunityForm {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  tags: string[];
  rules: string[];
}

const FORUM_CATEGORIES = [
  'All', 'General Discussion', 'Project Help', 'Tech Talk', 'Funding Advice',
  'Success Stories', 'Partnerships', 'Learning Resources', 'Industry News', 'Q&A'
];

const COMMUNITY_CATEGORIES = [
  'Technology', 'Startups', 'Design', 'Marketing', 'Business', 'AI/ML', 
  'Blockchain', 'Gaming', 'Health', 'Education', 'Finance', 'Other'
];

const CommunityPage: React.FC = () => {
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [topMembers, setTopMembers] = useState<CommunityMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'communities' | 'discussions' | 'members' | 'events' | 'resources'>('communities');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [createForm, setCreateForm] = useState<CreateCommunityForm>({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    tags: [],
    rules: []
  });
  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');

  // Mock data
  const mockForumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'How to validate your startup idea before building?',
      content: 'I have this amazing idea for a B2B SaaS platform, but I want to make sure there\'s actual demand before I start building. What are the best methods you\'ve used to validate ideas?',
      author: {
        name: 'startup_sarah',
        avatar: '/avatars/sarah.jpg',
        verified: true,
        reputation: 4.7,
        badges: ['Early Adopter', 'Top Contributor']
      },
      category: 'Funding Advice',
      tags: ['validation', 'startup', 'saas', 'market-research'],
      createdAt: '2025-09-14T08:30:00Z',
      metrics: {
        views: 234,
        likes: 45,
        replies: 18,
        upvotes: 52
      },
      isPinned: true,
      isHot: true,
      lastActivity: '2025-09-14T10:15:00Z'
    },
    {
      id: '2',
      title: 'Successfully raised $500K seed round - AMA',
      content: 'Just closed our seed round after 6 months of pitching. Happy to share what worked, what didn\'t, and answer any questions about the fundraising process.',
      author: {
        name: 'founder_mike',
        avatar: '/avatars/mike.jpg',
        verified: true,
        reputation: 4.9,
        badges: ['Successful Founder', 'Mentor', 'Investor']
      },
      category: 'Success Stories',
      tags: ['fundraising', 'seed', 'ama', 'success'],
      createdAt: '2025-09-13T14:20:00Z',
      metrics: {
        views: 1250,
        likes: 189,
        replies: 67,
        upvotes: 234
      },
      isPinned: false,
      isHot: true,
      lastActivity: '2025-09-14T09:45:00Z'
    },
    {
      id: '3',
      title: 'Looking for a technical co-founder for FinTech startup',
      content: 'Building a revolutionary payment platform for emerging markets. Have strong business background and initial funding. Looking for someone passionate about FinTech to join as CTO.',
      author: {
        name: 'fintech_founder',
        avatar: '/avatars/fintech.jpg',
        verified: false,
        reputation: 4.2,
        badges: ['Industry Expert']
      },
      category: 'Partnerships',
      tags: ['co-founder', 'fintech', 'cto', 'partnership'],
      createdAt: '2025-09-13T11:00:00Z',
      metrics: {
        views: 890,
        likes: 34,
        replies: 23,
        upvotes: 67
      },
      isPinned: false,
      isHot: false,
      lastActivity: '2025-09-14T07:30:00Z'
    }
  ];

  const mockTopMembers: CommunityMember[] = [
    {
      id: '1',
      name: 'alex_techguru',
      avatar: '/avatars/alex.jpg',
      title: 'Senior Full Stack Developer',
      reputation: 4.9,
      contributions: 156,
      verified: true,
      badges: ['Top Contributor', 'Mentor', 'Expert'],
      joinedAt: '2024-01-15',
      isOnline: true
    },
    {
      id: '2',
      name: 'investment_pro',
      avatar: '/avatars/investor.jpg',
      title: 'Venture Capital Partner',
      reputation: 4.8,
      contributions: 89,
      verified: true,
      badges: ['Investor', 'Mentor', 'Industry Expert'],
      joinedAt: '2024-03-20',
      isOnline: false
    },
    {
      id: '3',
      name: 'design_maven',
      avatar: '/avatars/designer.jpg',
      title: 'UX/UI Design Lead',
      reputation: 4.7,
      contributions: 134,
      verified: true,
      badges: ['Design Expert', 'Creative', 'Mentor'],
      joinedAt: '2024-02-10',
      isOnline: true
    }
  ];

  const mockEvents: CommunityEvent[] = [
    {
      id: '1',
      title: 'Startup Funding Masterclass',
      description: 'Learn from successful founders about raising capital, pitch decks, and investor relations.',
      type: 'webinar',
      startTime: '2025-09-20T18:00:00Z',
      duration: 90,
      attendees: 234,
      maxAttendees: 500,
      host: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg'
      },
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'AI Innovation Hackathon',
      description: '48-hour hackathon focused on building AI-powered solutions for real-world problems.',
      type: 'hackathon',
      startTime: '2025-09-25T09:00:00Z',
      duration: 2880, // 48 hours
      attendees: 156,
      maxAttendees: 200,
      host: {
        name: 'Tech Community',
        avatar: '/avatars/community.jpg'
      },
      status: 'upcoming'
    }
  ];

  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'React Developers',
      description: 'A community for React developers to share knowledge, ask questions, and collaborate on projects.',
      icon: '⚛️',
      category: 'Technology',
      memberCount: 15420,
      postCount: 2341,
      isPrivate: false,
      creator: {
        name: 'John React',
        avatar: '/avatars/john.jpg'
      },
      moderators: ['john_react', 'sarah_dev'],
      createdAt: '2024-01-15',
      tags: ['react', 'javascript', 'frontend', 'development'],
      rules: [
        'Be respectful to all members',
        'No spam or self-promotion without context',
        'Use appropriate channels for different topics',
        'Help others when you can'
      ]
    },
    {
      id: '2',
      name: 'AI & Machine Learning',
      description: 'Explore the latest in AI, ML, and deep learning. Share research, projects, and career advice.',
      icon: '🤖',
      category: 'AI/ML',
      memberCount: 8932,
      postCount: 1567,
      isPrivate: false,
      creator: {
        name: 'Dr. AI Smith',
        avatar: '/avatars/ai.jpg'
      },
      moderators: ['dr_ai', 'ml_expert'],
      createdAt: '2024-02-01',
      tags: ['ai', 'machine-learning', 'python', 'tensorflow', 'research'],
      rules: [
        'Share credible sources for research discussions',
        'Provide context for code snippets',
        'No homework dumping',
        'Encourage constructive feedback'
      ]
    },
    {
      id: '3',
      name: 'Startup Founders',
      description: 'Connect with fellow entrepreneurs, share experiences, and get advice on building successful startups.',
      icon: '🚀',
      category: 'Startups',
      memberCount: 12567,
      postCount: 3021,
      isPrivate: false,
      creator: {
        name: 'Entrepreneur Mike',
        avatar: '/avatars/mike.jpg'
      },
      moderators: ['mike_founder', 'startup_sarah'],
      createdAt: '2024-01-20',
      tags: ['startups', 'entrepreneurship', 'funding', 'business'],
      rules: [
        'No direct solicitation for investment',
        'Share genuine experiences and learnings',
        'Provide value before asking for help',
        'Respect confidential information'
      ]
    },
    {
      id: '4',
      name: 'Web3 Builders',
      description: 'Building the decentralized future. Discuss blockchain, DeFi, NFTs, and Web3 development.',
      icon: '⛓️',
      category: 'Blockchain',
      memberCount: 6843,
      postCount: 892,
      isPrivate: false,
      creator: {
        name: 'Crypto Dev',
        avatar: '/avatars/crypto.jpg'
      },
      moderators: ['crypto_dev', 'defi_expert'],
      createdAt: '2024-02-10',
      tags: ['web3', 'blockchain', 'ethereum', 'solidity', 'defi'],
      rules: [
        'No financial advice or shilling',
        'Focus on technical discussions',
        'Share open-source projects',
        'Respect different blockchain ecosystems'
      ]
    }
  ];

  // Form handlers
  const handleCreateCommunity = () => {
    if (!createForm.name || !createForm.description || !createForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCommunity: Community = {
      id: Date.now().toString(),
      name: createForm.name,
      description: createForm.description,
      icon: '🌟',
      category: createForm.category,
      memberCount: 1,
      postCount: 0,
      isPrivate: createForm.isPrivate,
      creator: {
        name: 'Current User', // In real app, this would come from auth context
        avatar: '/avatars/user.jpg'
      },
      moderators: ['current_user'],
      createdAt: new Date().toISOString().split('T')[0],
      tags: createForm.tags,
      rules: createForm.rules
    };

    setCommunities(prev => [...prev, newCommunity]);
    setShowCreateCommunity(false);
    setCreateForm({
      name: '',
      description: '',
      category: '',
      isPrivate: false,
      tags: [],
      rules: []
    });
    toast.success('Community created successfully!');
  };

  const addTag = () => {
    if (newTag.trim() && !createForm.tags.includes(newTag.trim())) {
      setCreateForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCreateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRule = () => {
    if (newRule.trim() && !createForm.rules.includes(newRule.trim())) {
      setCreateForm(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (ruleToRemove: string) => {
    setCreateForm(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule !== ruleToRemove)
    }));
  };

  useEffect(() => {
    // Initialize with mock communities
    setCommunities(mockCommunities);
    
    setTimeout(() => {
      setForumPosts(mockForumPosts);
      setTopMembers(mockTopMembers);
      setUpcomingEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId: string) => {
    setForumPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            metrics: {
              ...post.metrics,
              likes: post.metrics.likes + 1
            }
          }
        : post
    ));
    toast.success('Post liked!');
  };

  const handleUpvote = (postId: string) => {
    setForumPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            metrics: {
              ...post.metrics,
              upvotes: post.metrics.upvotes + 1
            }
          }
        : post
    ));
    toast.success('Post upvoted!');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const created = new Date(dateString).getTime();
    const diffInHours = (now - created) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Small Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communities</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discover and join interest-based communities</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateCommunity(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Create Community</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">12.4K</div>
                <div className="text-sm text-gray-400">Members</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">3.2K</div>
                <div className="text-sm text-gray-400">Discussions</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">856</div>
                <div className="text-sm text-gray-400">Mentors</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <RocketLaunchIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">127</div>
                <div className="text-sm text-gray-400">Success Stories</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-2 bg-secondary-800/30 backdrop-blur-xl rounded-xl p-2 border border-secondary-700/50">
          {[
            { id: 'communities', label: 'Communities', icon: UserGroupIcon },
            { id: 'discussions', label: 'Discussions', icon: ChatBubbleLeftRightIcon },
            { id: 'members', label: 'Members', icon: UserGroupIcon },
            { id: 'events', label: 'Events', icon: SparklesIcon },
            { id: 'resources', label: 'Resources', icon: BookOpenIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-secondary-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
          {activeTab === 'communities' && (
            <motion.div
              key="communities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search communities..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All Categories</option>
                  {COMMUNITY_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Communities Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communities.map((community) => (
                  <motion.div
                    key={community.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Community Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        {community.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {community.name}
                        </h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                          {community.category}
                        </span>
                      </div>
                      {community.isPrivate && (
                        <div className="text-yellow-500" title="Private Community">
                          <LockClosedIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {community.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {community.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{community.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{community.memberCount.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>{community.postCount}</span>
                        </span>
                      </div>
                      <span className="text-xs">
                        Created {new Date(community.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Join Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      {community.isPrivate ? 'Request to Join' : 'Join Community'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {communities.length === 0 && (
                <div className="text-center py-16">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Communities Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be the first to create a community and bring people together!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateCommunity(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Create Your First Community
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              {/* Main Discussions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {FORUM_CATEGORIES.map(category => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>

                {/* Forum Posts */}
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{post.author.name}</h4>
                            {post.author.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            {post.isPinned && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                                Pinned
                              </span>
                            )}
                            {post.isHot && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs font-medium flex items-center space-x-1">
                                <FireSolid className="w-3 h-3" />
                                <span>Hot</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <span>•</span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-xl font-bold text-white mb-3 hover:text-blue-300 transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-secondary-700/50 text-gray-300 rounded-lg text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-secondary-700/50">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleUpvote(post.id)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <ArrowUpIcon className="w-5 h-5" />
                            <span className="text-sm">{post.metrics.upvotes}</span>
                          </button>
                          
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <HeartIcon className="w-5 h-5" />
                            <span className="text-sm">{post.metrics.likes}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                            <ChatBubbleLeftIcon className="w-5 h-5" />
                            <span className="text-sm">{post.metrics.replies}</span>
                          </button>
                          
                          <div className="flex items-center space-x-2 text-gray-400">
                            <EyeIcon className="w-5 h-5" />
                            <span className="text-sm">{post.metrics.views}</span>
                          </div>
                        </div>

                        <span className="text-sm text-gray-400">
                          Last activity: {formatTimeAgo(post.lastActivity)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Contributors */}
                <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <span>Top Contributors</span>
                  </h3>
                  <div className="space-y-4">
                    {topMembers.slice(0, 5).map((member, index) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          {member.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-secondary-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{member.name}</span>
                            <span className="text-yellow-400 text-sm">#{index + 1}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <StarSolid className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-gray-400">{member.reputation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-purple-400" />
                    <span>Upcoming Events</span>
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 bg-secondary-700/30 rounded-lg">
                        <h4 className="text-white font-medium mb-2">{event.title}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{formatEventTime(event.startTime)}</span>
                          <span>{event.attendees}/{event.maxAttendees}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {topMembers.map((member) => (
                <div key={member.id} className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-full"
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-secondary-800 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{member.name}</h3>
                      <p className="text-gray-400 text-sm">{member.title}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <StarSolid className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">{member.reputation}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.badges.map(badge => (
                      <span key={badge} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-white font-medium">{member.contributions}</div>
                      <div className="text-xs text-gray-400">Contributions</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {Math.floor((Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-xs text-gray-400">Days Active</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      event.type === 'webinar' ? 'bg-blue-500/20 text-blue-300' :
                      event.type === 'hackathon' ? 'bg-purple-500/20 text-purple-300' :
                      event.type === 'workshop' ? 'bg-green-500/20 text-green-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatEventTime(event.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{event.attendees} / {event.maxAttendees} attendees</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Join Event
                  </motion.button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Learning Resources</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive guides, tutorials, and resources coming soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Community</h2>
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community and its purpose"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {COMMUNITY_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={createForm.isPrivate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this community private (invite-only)
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {createForm.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Community Rules
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a community rule"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addRule()}
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {createForm.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rule}</span>
                      <button
                        type="button"
                        onClick={() => removeRule(rule)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateCommunity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Community
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;