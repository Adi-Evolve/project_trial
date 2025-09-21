import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid
} from '@heroicons/react/24/solid';

interface TrendingItem {
  id: string;
  type: 'project' | 'idea' | 'user';
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  metrics: {
    upvotes: number;
    comments: number;
    views: number;
    shares: number;
    growth: number; // percentage growth
  };
  category: string;
  tags: string[];
  image?: string;
  createdDate: string;
  rank: number;
  previousRank?: number;
}

const TrendingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [contentType, setContentType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock trending data
  const trendingItems: TrendingItem[] = [
    {
      id: '1',
      type: 'project',
      title: 'AI-Powered Code Review Assistant',
      description: 'Automated code review system using machine learning to catch bugs and suggest improvements',
      author: {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=50&h=50&fit=crop&crop=face'
      },
      metrics: {
        upvotes: 456,
        comments: 89,
        views: 2340,
        shares: 67,
        growth: 234.5
      },
      category: 'AI/ML',
      tags: ['AI', 'Code Review', 'Developer Tools', 'Machine Learning'],
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
      createdDate: '2024-02-08',
      rank: 1,
      previousRank: 5
    },
    {
      id: '2',
      type: 'idea',
      title: 'Sustainable Supply Chain Tracker',
      description: 'Blockchain platform for tracking product origins and environmental impact',
      author: {
        id: '2',
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face'
      },
      metrics: {
        upvotes: 389,
        comments: 76,
        views: 1890,
        shares: 45,
        growth: 189.3
      },
      category: 'Blockchain',
      tags: ['Blockchain', 'Sustainability', 'Supply Chain'],
      createdDate: '2024-02-10',
      rank: 2,
      previousRank: 8
    },
    {
      id: '3',
      type: 'project',
      title: 'Mental Health Companion App',
      description: 'AI-driven mental wellness platform with mood tracking and personalized recommendations',
      author: {
        id: '3',
        name: 'Emily Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
      },
      metrics: {
        upvotes: 342,
        comments: 124,
        views: 1678,
        shares: 38,
        growth: 156.7
      },
      category: 'Health',
      tags: ['Mental Health', 'AI', 'Mobile App', 'Wellness'],
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      createdDate: '2024-02-05',
      rank: 3,
      previousRank: 2
    },
    {
      id: '4',
      type: 'idea',
      title: 'Local Food Waste Reduction Network',
      description: 'Community platform connecting restaurants with food banks to reduce waste',
      author: {
        id: '4',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      },
      metrics: {
        upvotes: 298,
        comments: 67,
        views: 1456,
        shares: 29,
        growth: 142.8
      },
      category: 'Environment',
      tags: ['Food Waste', 'Community', 'Sustainability'],
      createdDate: '2024-02-09',
      rank: 4,
      previousRank: 12
    },
    {
      id: '5',
      type: 'project',
      title: 'Decentralized Learning Platform',
      description: 'Peer-to-peer education platform with cryptocurrency rewards for knowledge sharing',
      author: {
        id: '5',
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face'
      },
      metrics: {
        upvotes: 276,
        comments: 54,
        views: 1234,
        shares: 31,
        growth: 128.4
      },
      category: 'Education',
      tags: ['Education', 'Blockchain', 'P2P Learning'],
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop',
      createdDate: '2024-02-07',
      rank: 5,
      previousRank: 3
    }
  ];

  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'project', label: 'Projects' },
    { value: 'idea', label: 'Ideas' },
    { value: 'user', label: 'Users' }
  ];

  const categories = ['All', 'AI/ML', 'Blockchain', 'Health', 'Environment', 'Education', 'Finance', 'Social Impact'];

  const filteredItems = trendingItems.filter(item => {
    const matchesType = contentType === 'all' || item.type === contentType;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesType && matchesCategory;
  });

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return { type: 'new', value: 0 };
    if (current < previous) return { type: 'up', value: previous - current };
    if (current > previous) return { type: 'down', value: current - previous };
    return { type: 'same', value: 0 };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <RocketLaunchIcon className="w-4 h-4" />;
      case 'idea':
        return <LightBulbIcon className="w-4 h-4" />;
      case 'user':
        return <UserGroupIcon className="w-4 h-4" />;
      default:
        return <FireIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-blue-400';
      case 'idea':
        return 'text-yellow-400';
      case 'user':
        return 'text-green-400';
      default:
        return 'text-orange-400';
    }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6">
            <FireSolid className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Trending</h1>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Discover the hottest projects, ideas, and creators in the community. 
            See what's gaining momentum and join the conversation.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-secondary-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-secondary-400" />
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
                >
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-secondary-400">
              Updated every hour • {filteredItems.length} trending items
            </div>
          </div>
        </motion.div>

        {/* Trending Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { 
              label: 'Total Views', 
              value: filteredItems.reduce((sum, item) => sum + item.metrics.views, 0).toLocaleString(), 
              color: 'text-blue-400',
              icon: EyeIcon
            },
            { 
              label: 'Total Upvotes', 
              value: filteredItems.reduce((sum, item) => sum + item.metrics.upvotes, 0).toLocaleString(), 
              color: 'text-red-400',
              icon: HeartIcon
            },
            { 
              label: 'Total Comments', 
              value: filteredItems.reduce((sum, item) => sum + item.metrics.comments, 0).toLocaleString(), 
              color: 'text-green-400',
              icon: ChatBubbleLeftIcon
            },
            { 
              label: 'Avg Growth', 
              value: `${(filteredItems.reduce((sum, item) => sum + item.metrics.growth, 0) / filteredItems.length).toFixed(1)}%`, 
              color: 'text-orange-400',
              icon: ArrowTrendingUpIcon
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="glass-light rounded-xl p-4 text-center"
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-secondary-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trending List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredItems.map((item, index) => {
            const rankChange = getRankChange(item.rank, item.previousRank);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-xl p-6 group"
              >
                <div className="flex items-start space-x-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-2">
                      #{item.rank}
                    </div>
                    <div className="flex items-center justify-center">
                      {rankChange.type === 'up' && (
                        <div className="flex items-center text-green-400 text-xs">
                          <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                          <span>+{rankChange.value}</span>
                        </div>
                      )}
                      {rankChange.type === 'down' && (
                        <div className="flex items-center text-red-400 text-xs">
                          <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                          <span>-{rankChange.value}</span>
                        </div>
                      )}
                      {rankChange.type === 'new' && (
                        <div className="text-yellow-400 text-xs font-medium">NEW</div>
                      )}
                      {rankChange.type === 'same' && (
                        <div className="text-secondary-500 text-xs">—</div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {item.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-16 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-1 ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                      </div>
                      <span className="text-sm text-primary-400">{item.category}</span>
                      <div className="flex items-center space-x-1 text-xs text-secondary-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>{new Date(item.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-secondary-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-secondary-300">by {item.author.name}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 4 && (
                        <span className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full">
                          +{item.tags.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="flex items-center space-x-1 text-secondary-400">
                          <HeartIcon className="w-4 h-4" />
                          <span>{item.metrics.upvotes.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-secondary-400">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{item.metrics.comments}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-secondary-400">
                          <EyeIcon className="w-4 h-4" />
                          <span>{item.metrics.views.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-secondary-400">
                          <ShareIcon className="w-4 h-4" />
                          <span>{item.metrics.shares}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-green-400 text-sm font-medium">
                          <ArrowTrendingUpIcon className="w-4 h-4" />
                          <span>+{item.metrics.growth.toFixed(1)}%</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          View
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trending Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Trending Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { category: 'AI/ML', count: 23, growth: 45.2, color: 'from-blue-500 to-purple-500' },
              { category: 'Environment', count: 18, growth: 32.8, color: 'from-green-500 to-teal-500' },
              { category: 'Health', count: 15, growth: 28.4, color: 'from-red-500 to-pink-500' }
            ].map((cat, index) => (
              <motion.div
                key={cat.category}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-xl p-6"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${cat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{cat.category}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-400">{cat.count} trending items</span>
                  <span className="flex items-center space-x-1 text-green-400">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    <span>+{cat.growth}%</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendingPage;