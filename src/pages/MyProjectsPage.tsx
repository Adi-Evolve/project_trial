import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Paused' | 'Archived';
  visibility: 'Public' | 'Private' | 'Unlisted';
  upvotes: number;
  comments: number;
  views: number;
  shares: number;
  collaborators: number;
  createdDate: string;
  lastUpdated: string;
  image?: string;
  tags: string[];
  progress: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const MyProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'AI Code Assistant',
      description: 'An intelligent coding assistant powered by machine learning that helps developers write better code faster.',
      category: 'AI/ML',
      status: 'Active',
      visibility: 'Public',
      upvotes: 234,
      comments: 45,
      views: 1250,
      shares: 28,
      collaborators: 3,
      createdDate: '2024-01-15',
      lastUpdated: '2024-02-10',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
      tags: ['AI', 'Machine Learning', 'Developer Tools', 'VS Code'],
      progress: 75,
      isLiked: true,
      isBookmarked: true
    },
    {
      id: '2',
      title: 'Sustainable Energy Tracker',
      description: 'Mobile app for tracking renewable energy consumption and carbon footprint reduction.',
      category: 'Environment',
      status: 'Completed',
      visibility: 'Public',
      upvotes: 189,
      comments: 32,
      views: 890,
      shares: 15,
      collaborators: 2,
      createdDate: '2023-11-20',
      lastUpdated: '2024-01-08',
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop',
      tags: ['Environment', 'Mobile App', 'React Native', 'Sustainability'],
      progress: 100
    },
    {
      id: '3',
      title: 'Local Community Hub',
      description: 'Platform connecting neighbors for local services, events, and community building.',
      category: 'Social',
      status: 'Active',
      visibility: 'Public',
      upvotes: 156,
      comments: 28,
      views: 675,
      shares: 12,
      collaborators: 5,
      createdDate: '2024-02-01',
      lastUpdated: '2024-02-08',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop',
      tags: ['Community', 'Social Network', 'Local Services', 'React'],
      progress: 60
    },
    {
      id: '4',
      title: 'Blockchain Voting System',
      description: 'Secure and transparent voting system using blockchain technology.',
      category: 'Blockchain',
      status: 'Draft',
      visibility: 'Private',
      upvotes: 0,
      comments: 0,
      views: 0,
      shares: 0,
      collaborators: 1,
      createdDate: '2024-02-12',
      lastUpdated: '2024-02-12',
      tags: ['Blockchain', 'Voting', 'Ethereum', 'Smart Contracts'],
      progress: 15
    },
    {
      id: '5',
      title: 'Health & Fitness Companion',
      description: 'Comprehensive health tracking app with AI-powered personalized recommendations.',
      category: 'Health',
      status: 'Paused',
      visibility: 'Unlisted',
      upvotes: 67,
      comments: 12,
      views: 340,
      shares: 5,
      collaborators: 2,
      createdDate: '2023-10-15',
      lastUpdated: '2024-01-20',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      tags: ['Health', 'Fitness', 'AI', 'Mobile App', 'iOS'],
      progress: 40
    }
  ]);

  const statusOptions = ['All', 'Draft', 'Active', 'Completed', 'Paused', 'Archived'];
  const categoryOptions = ['All', 'AI/ML', 'Environment', 'Social', 'Blockchain', 'Health', 'Education', 'Finance'];
  const sortOptions = [
    { value: 'lastUpdated', label: 'Last Updated' },
    { value: 'createdDate', label: 'Created Date' },
    { value: 'upvotes', label: 'Most Upvoted' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'title', label: 'Alphabetical' }
  ];

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'createdDate':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'views':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Archived':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <PlayIcon className="w-3 h-3" />;
      case 'Completed':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'Draft':
        return <PencilIcon className="w-3 h-3" />;
      case 'Paused':
        return <PauseIcon className="w-3 h-3" />;
      case 'Archived':
        return <XCircleIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'Public':
        return 'text-green-400';
      case 'Private':
        return 'text-red-400';
      case 'Unlisted':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const toggleProjectStatus = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, status: p.status === 'Active' ? 'Paused' : 'Active' as any }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
              <p className="text-secondary-300">Manage and track your project portfolio</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Projects', value: projects.length, color: 'text-blue-400' },
            { label: 'Active', value: projects.filter(p => p.status === 'Active').length, color: 'text-green-400' },
            { label: 'Total Upvotes', value: projects.reduce((sum, p) => sum + p.upvotes, 0), color: 'text-red-400' },
            { label: 'Total Views', value: projects.reduce((sum, p) => sum + p.views, 0).toLocaleString(), color: 'text-purple-400' }
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

        {/* Filters and Search */}
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center space-x-4">
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
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

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-secondary-700 text-secondary-400'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-current rounded-sm"></div>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-secondary-700 text-secondary-400'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-current h-0.5 rounded"></div>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedStatus !== 'All' || selectedCategory !== 'All' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-secondary-700">
              <span className="text-sm text-secondary-400">Active filters:</span>
              {selectedStatus !== 'All' && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Category: {selectedCategory}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Search: "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs text-secondary-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Projects Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredProjects.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-secondary-400 mb-6">
                {searchQuery || selectedStatus !== 'All' || selectedCategory !== 'All'
                  ? 'Try adjusting your filters or search query.'
                  : 'Create your first project to get started!'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create New Project</span>
              </motion.button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`glass rounded-xl overflow-hidden group ${
                    viewMode === 'list' ? 'flex items-center space-x-6 p-6' : ''
                  }`}
                >
                  {/* Project Image */}
                  {project.image && (
                    <div className={viewMode === 'list' ? 'w-32 h-20 flex-shrink-0' : 'relative'}>
                      <img
                        src={project.image}
                        alt={project.title}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-full rounded-lg' : 'w-full h-48'
                        }`}
                      />
                      {viewMode === 'grid' && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)} flex items-center space-x-1`}>
                            {getStatusIcon(project.status)}
                            <span>{project.status}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Content */}
                  <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'p-6'}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-primary-400">{project.category}</span>
                          {viewMode === 'list' && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)} flex items-center space-x-1`}>
                              {getStatusIcon(project.status)}
                              <span>{project.status}</span>
                            </span>
                          )}
                          <span className={`text-xs ${getVisibilityColor(project.visibility)}`}>
                            {project.visibility}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-primary-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className={`text-secondary-400 mb-4 ${
                          viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                        }`}>
                          {project.description}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-secondary-700/50 hover:bg-secondary-600/50 transition-colors"
                          title="Edit Project"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleProjectStatus(project.id)}
                          className="p-2 rounded-lg bg-secondary-700/50 hover:bg-secondary-600/50 transition-colors"
                          title={project.status === 'Active' ? 'Pause Project' : 'Activate Project'}
                        >
                          {project.status === 'Active' ? 
                            <PauseIcon className="w-4 h-4" /> : 
                            <PlayIcon className="w-4 h-4" />
                          }
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-secondary-700/50 hover:bg-secondary-600/50 transition-colors"
                          title="View Analytics"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400"
                          title="Delete Project"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-secondary-400">Progress</span>
                        <span className="text-xs text-secondary-400">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-secondary-500">
                        <span className="flex items-center space-x-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{project.upvotes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{project.comments}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{project.views}</span>
                        </span>
                        {project.collaborators > 1 && (
                          <span className="flex items-center space-x-1">
                            <span className="text-xs">👥</span>
                            <span>{project.collaborators}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-secondary-500">
                        Updated {new Date(project.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyProjectsPage;