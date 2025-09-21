import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  LightBulbIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  UserGroupIcon,
  TagIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  EyeIcon,
  HandRaisedIcon,
  BeakerIcon,
  BoltIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  upvotes: number;
  comments: number;
  views: number;
  shares: number;
  bookmarks: number;
  tags: string[];
  createdDate: string;
  lastUpdated: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Seeking Team';
  isLiked?: boolean;
  isBookmarked?: boolean;
  collaborators: number;
  requiredSkills: string[];
  lookingFor: string[];
}

const IdeaHubPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mock ideas data
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'AI-Powered Learning Assistant for Students with Disabilities',
      description: 'Create an intelligent tutoring system that adapts to different learning disabilities, providing personalized content delivery, voice-to-text capabilities, and progress tracking with visual/auditory feedback.',
      category: 'AI/ML',
      complexity: 'Advanced',
      timeEstimate: '6-12 months',
      author: {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=50&h=50&fit=crop&crop=face',
        reputation: 2450
      },
      upvotes: 128,
      comments: 34,
      views: 890,
      shares: 15,
      bookmarks: 67,
      tags: ['AI', 'Education', 'Accessibility', 'Machine Learning', 'React'],
      createdDate: '2024-02-10',
      lastUpdated: '2024-02-12',
      status: 'Seeking Team',
      isLiked: true,
      isBookmarked: false,
      collaborators: 2,
      requiredSkills: ['Python', 'TensorFlow', 'React', 'Node.js', 'UI/UX Design'],
      lookingFor: ['ML Engineer', 'Frontend Developer', 'UX Designer']
    },
    {
      id: '2',
      title: 'Sustainable Supply Chain Tracker',
      description: 'Blockchain-based platform to track products from source to consumer, ensuring ethical sourcing and environmental sustainability with real-time carbon footprint calculation.',
      category: 'Blockchain',
      complexity: 'Intermediate',
      timeEstimate: '4-8 months',
      author: {
        id: '2',
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        reputation: 1890
      },
      upvotes: 95,
      comments: 28,
      views: 654,
      shares: 12,
      bookmarks: 43,
      tags: ['Blockchain', 'Sustainability', 'Supply Chain', 'Environment', 'Web3'],
      createdDate: '2024-02-08',
      lastUpdated: '2024-02-11',
      status: 'Open',
      collaborators: 0,
      requiredSkills: ['Solidity', 'React', 'Node.js', 'Web3.js'],
      lookingFor: ['Blockchain Developer', 'Backend Developer', 'Product Manager']
    },
    {
      id: '3',
      title: 'Mental Health Support Network for Remote Workers',
      description: 'Platform connecting remote workers with mental health resources, peer support groups, and AI-driven mood tracking with personalized wellness recommendations.',
      category: 'Health',
      complexity: 'Intermediate',
      timeEstimate: '3-6 months',
      author: {
        id: '3',
        name: 'Emily Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        reputation: 1650
      },
      upvotes: 156,
      comments: 45,
      views: 1200,
      shares: 28,
      bookmarks: 89,
      tags: ['Health', 'Mental Wellness', 'Remote Work', 'Community', 'AI'],
      createdDate: '2024-02-05',
      lastUpdated: '2024-02-10',
      status: 'In Progress',
      isBookmarked: true,
      collaborators: 3,
      requiredSkills: ['React', 'Node.js', 'Python', 'UI/UX Design'],
      lookingFor: ['Therapist/Counselor', 'Data Scientist', 'Mobile Developer']
    },
    {
      id: '4',
      title: 'Local Food Waste Reduction App',
      description: 'Mobile app connecting restaurants, groceries, and consumers to reduce food waste through real-time surplus food notifications and pickup coordination.',
      category: 'Environment',
      complexity: 'Beginner',
      timeEstimate: '2-4 months',
      author: {
        id: '4',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        reputation: 980
      },
      upvotes: 203,
      comments: 67,
      views: 1450,
      shares: 35,
      bookmarks: 124,
      tags: ['Environment', 'Food Waste', 'Mobile App', 'Community', 'Social Impact'],
      createdDate: '2024-02-01',
      lastUpdated: '2024-02-09',
      status: 'Seeking Team',
      collaborators: 1,
      requiredSkills: ['React Native', 'Firebase', 'UI/UX Design'],
      lookingFor: ['Mobile Developer', 'Backend Developer', 'Marketing Specialist']
    },
    {
      id: '5',
      title: 'Decentralized Scientific Research Collaboration Platform',
      description: 'Create a platform where researchers worldwide can collaborate on studies, share data securely, and publish findings through decentralized peer review.',
      category: 'Education',
      complexity: 'Advanced',
      timeEstimate: '8-12 months',
      author: {
        id: '5',
        name: 'Dr. Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face',
        reputation: 3200
      },
      upvotes: 89,
      comments: 23,
      views: 567,
      shares: 9,
      bookmarks: 45,
      tags: ['Research', 'Blockchain', 'Science', 'Collaboration', 'Peer Review'],
      createdDate: '2024-01-28',
      lastUpdated: '2024-02-07',
      status: 'Open',
      collaborators: 0,
      requiredSkills: ['Blockchain', 'Python', 'Data Science', 'Security'],
      lookingFor: ['Research Scientist', 'Blockchain Developer', 'Data Engineer']
    }
  ]);

  const categories = ['All', 'AI/ML', 'Blockchain', 'Health', 'Environment', 'Education', 'Finance', 'Social Impact'];
  const complexityLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const statusOptions = ['All', 'Open', 'In Progress', 'Completed', 'Seeking Team'];
  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'mostUpvoted', label: 'Most Upvoted' },
    { value: 'mostCommented', label: 'Most Discussed' },
    { value: 'mostBookmarked', label: 'Most Bookmarked' }
  ];

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
      const matchesComplexity = selectedComplexity === 'All' || idea.complexity === selectedComplexity;
      const matchesStatus = selectedStatus === 'All' || idea.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesComplexity && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'mostUpvoted':
          return b.upvotes - a.upvotes;
        case 'mostCommented':
          return b.comments - a.comments;
        case 'mostBookmarked':
          return b.bookmarks - a.bookmarks;
        case 'trending':
        default:
          // Trending calculation based on recent activity and engagement
          const aScore = (a.upvotes * 0.3) + (a.comments * 0.4) + (a.views * 0.1) + (a.bookmarks * 0.2);
          const bScore = (b.upvotes * 0.3) + (b.comments * 0.4) + (b.views * 0.1) + (b.bookmarks * 0.2);
          return bScore - aScore;
      }
    });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'In Progress':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Seeking Team':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI/ML':
        return <BeakerIcon className="w-4 h-4" />;
      case 'Blockchain':
        return <BoltIcon className="w-4 h-4" />;
      case 'Health':
        return <HeartIcon className="w-4 h-4" />;
      case 'Environment':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'Education':
        return <AcademicCapIcon className="w-4 h-4" />;
      case 'Finance':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      default:
        return <LightBulbIcon className="w-4 h-4" />;
    }
  };

  const handleUpvote = (ideaId: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            upvotes: idea.isLiked ? idea.upvotes - 1 : idea.upvotes + 1,
            isLiked: !idea.isLiked
          }
        : idea
    ));
  };

  const handleBookmark = (ideaId: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            bookmarks: idea.isBookmarked ? idea.bookmarks - 1 : idea.bookmarks + 1,
            isBookmarked: !idea.isBookmarked
          }
        : idea
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl mb-6">
            <LightBulbIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Idea Hub</h1>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto mb-8">
            Discover, share, and collaborate on innovative project ideas. 
            Find your next big project or help bring someone else's vision to life.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Submit Your Idea</span>
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Active Ideas', value: ideas.filter(i => i.status === 'Open' || i.status === 'Seeking Team').length, color: 'text-blue-400' },
            { label: 'In Progress', value: ideas.filter(i => i.status === 'In Progress').length, color: 'text-orange-400' },
            { label: 'Total Upvotes', value: ideas.reduce((sum, i) => sum + i.upvotes, 0), color: 'text-red-400' },
            { label: 'Collaborators', value: ideas.reduce((sum, i) => sum + i.collaborators, 0), color: 'text-green-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="glass-light rounded-xl p-4 text-center"
            >
              <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-secondary-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search ideas, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {complexityLevels.map(level => (
                  <option key={level} value={level}>{level === 'All' ? 'All Levels' : level}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Ideas Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl p-6 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={idea.author.avatar}
                    alt={idea.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-white">{idea.author.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-secondary-400">
                      <StarSolid className="w-3 h-3 text-yellow-400" />
                      <span>{idea.author.reputation}</span>
                      <span>•</span>
                      <span>{new Date(idea.createdDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(idea.status)}`}>
                    {idea.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getCategoryIcon(idea.category)}
                  <span className="text-sm text-primary-400">{idea.category}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getComplexityColor(idea.complexity)}`}>
                    {idea.complexity}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors line-clamp-2">
                  {idea.title}
                </h3>
                <p className="text-secondary-400 line-clamp-3 mb-3">
                  {idea.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-secondary-500 mb-3">
                  <span className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{idea.timeEstimate}</span>
                  </span>
                  {idea.collaborators > 0 && (
                    <span className="flex items-center space-x-1">
                      <UserGroupIcon className="w-3 h-3" />
                      <span>{idea.collaborators} collaborator{idea.collaborators !== 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-xs text-secondary-400 mb-2">Required Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {idea.requiredSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {idea.requiredSkills.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full">
                      +{idea.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Looking For */}
              {idea.lookingFor.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-secondary-400 mb-2">Looking for:</div>
                  <div className="flex flex-wrap gap-1">
                    {idea.lookingFor.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 text-xs bg-primary-500/20 text-primary-300 rounded-full border border-primary-500/30"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-secondary-600/50 text-secondary-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {idea.tags.length > 4 && (
                  <span className="px-2 py-1 text-xs bg-secondary-600/50 text-secondary-300 rounded-full">
                    +{idea.tags.length - 4}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpvote(idea.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      idea.isLiked ? 'text-red-400' : 'text-secondary-400 hover:text-red-400'
                    } transition-colors`}
                  >
                    {idea.isLiked ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    <span>{idea.upvotes}</span>
                  </motion.button>
                  <span className="flex items-center space-x-1 text-sm text-secondary-400">
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    <span>{idea.comments}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-sm text-secondary-400">
                    <EyeIcon className="w-4 h-4" />
                    <span>{idea.views}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleBookmark(idea.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      idea.isBookmarked 
                        ? 'text-yellow-400 bg-yellow-500/20' 
                        : 'text-secondary-400 hover:text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                  >
                    {idea.isBookmarked ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-sm py-2 px-4 flex items-center space-x-1"
                  >
                    <HandRaisedIcon className="w-4 h-4" />
                    <span>Join Project</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-white mb-2">No ideas found</h3>
            <p className="text-secondary-400 mb-6">
              Try adjusting your filters or be the first to share an idea in this category!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Submit Your Idea</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IdeaHubPage;