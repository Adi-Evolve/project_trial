import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LightBulbIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { 
  LightBulbIcon as LightBulbSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    reputation: number;
  };
  price: number;
  currency: 'ETH' | 'USD';
  type: 'exclusive' | 'license' | 'collaboration';
  visibility: 'public' | 'premium' | 'private';
  blockchain: {
    verified: boolean;
    txHash: string;
    ipfsHash: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    rating: number;
    potential: number;
  };
  createdAt: string;
  status: 'available' | 'sold' | 'pending' | 'draft';
  bidding?: {
    enabled: boolean;
    currentBid: number;
    bidders: number;
    endTime: string;
  };
}

const IDEAS_CATEGORIES = [
  'All', 'Technology', 'Healthcare', 'Fintech', 'AI/ML', 'Blockchain',
  'IoT', 'SaaS', 'E-commerce', 'Gaming', 'Education', 'Social Media',
  'Environment', 'Entertainment', 'Mobile Apps', 'Hardware'
];

const IDEAS_FILTERS = [
  { value: 'all', label: 'All Ideas' },
  { value: 'available', label: 'Available' },
  { value: 'trending', label: 'Trending' },
  { value: 'premium', label: 'Premium' },
  { value: 'verified', label: 'Blockchain Verified' },
  { value: 'bidding', label: 'Live Bidding' }
];

const IdeasPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mock data for ideas marketplace
  const mockIdeas: Idea[] = [
    {
      id: '1',
      title: 'AI-Powered Code Review Assistant',
      description: 'Revolutionary AI system that automatically reviews code for bugs, security vulnerabilities, and optimization opportunities. Uses advanced machine learning to understand context and provide intelligent suggestions.',
      category: 'AI/ML',
      tags: ['AI', 'Code Review', 'Developer Tools', 'Machine Learning'],
      author: {
        name: 'alex_dev',
        avatar: '/avatars/alex.jpg',
        verified: true,
        reputation: 4.8
      },
      price: 2.5,
      currency: 'ETH',
      type: 'exclusive',
      visibility: 'public',
      blockchain: {
        verified: true,
        txHash: '0x1234...abcd',
        ipfsHash: 'QmX1Y2Z3...'
      },
      metrics: {
        views: 1250,
        likes: 89,
        comments: 24,
        rating: 4.7,
        potential: 9.2
      },
      createdAt: '2025-09-10',
      status: 'available',
      bidding: {
        enabled: true,
        currentBid: 3.1,
        bidders: 12,
        endTime: '2025-09-20T12:00:00Z'
      }
    },
    {
      id: '2',
      title: 'Sustainable Supply Chain Tracker',
      description: 'Blockchain-based platform for tracking products throughout their entire supply chain, ensuring sustainability and ethical sourcing. Perfect for conscious consumers and businesses.',
      category: 'Blockchain',
      tags: ['Sustainability', 'Supply Chain', 'Blockchain', 'ESG'],
      author: {
        name: 'green_innovator',
        avatar: '/avatars/green.jpg',
        verified: true,
        reputation: 4.6
      },
      price: 15000,
      currency: 'USD',
      type: 'license',
      visibility: 'premium',
      blockchain: {
        verified: true,
        txHash: '0x5678...efgh',
        ipfsHash: 'QmA4B5C6...'
      },
      metrics: {
        views: 890,
        likes: 156,
        comments: 31,
        rating: 4.9,
        potential: 8.8
      },
      createdAt: '2025-09-08',
      status: 'available'
    },
    {
      id: '3',
      title: 'Mental Health Companion App',
      description: 'AI-driven mental health application that provides personalized therapy sessions, mood tracking, and crisis intervention. Uses advanced psychology models and real-time data analysis.',
      category: 'Healthcare',
      tags: ['Mental Health', 'AI', 'Therapy', 'Wellness'],
      author: {
        name: 'dr_mindcare',
        avatar: '/avatars/doctor.jpg',
        verified: true,
        reputation: 4.9
      },
      price: 1.8,
      currency: 'ETH',
      type: 'collaboration',
      visibility: 'public',
      blockchain: {
        verified: true,
        txHash: '0x9abc...ijkl',
        ipfsHash: 'QmD7E8F9...'
      },
      metrics: {
        views: 2100,
        likes: 203,
        comments: 67,
        rating: 4.8,
        potential: 9.5
      },
      createdAt: '2025-09-12',
      status: 'available'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIdeas(mockIdeas);
      setFilteredIdeas(mockIdeas);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortIdeas();
  }, [ideas, searchQuery, selectedCategory, selectedFilter]);

  const filterAndSortIdeas = () => {
    let filtered = [...ideas];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.tags.some(tag => tag.toLowerCase().includes(query)) ||
        idea.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Special filters
    switch (selectedFilter) {
      case 'available':
        filtered = filtered.filter(idea => idea.status === 'available');
        break;
      case 'trending':
        filtered = filtered.sort((a, b) => b.metrics.potential - a.metrics.potential);
        break;
      case 'premium':
        filtered = filtered.filter(idea => idea.visibility === 'premium');
        break;
      case 'verified':
        filtered = filtered.filter(idea => idea.blockchain.verified);
        break;
      case 'bidding':
        filtered = filtered.filter(idea => idea.bidding?.enabled);
        break;
    }

    setFilteredIdeas(filtered);
  };

  const handleLike = (ideaId: string) => {
    setIdeas(prev => prev.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            metrics: {
              ...idea.metrics,
              likes: idea.metrics.likes + 1
            }
          }
        : idea
    ));
    toast.success('Idea liked!');
  };

  const handleSubmitIdea = () => {
    setShowSubmitModal(true);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'ETH') {
      return `${price} ETH`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border-b border-secondary-700/50 sticky top-16 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                  <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Ideas Marketplace</h1>
                  <p className="text-gray-400 text-lg">
                    Discover, buy, and sell innovative ideas secured by blockchain
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitIdea}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-400 hover:to-blue-400 transition-all duration-200 flex items-center space-x-3 font-medium shadow-lg shadow-purple-500/25"
              >
                <LightBulbSolid className="w-6 h-6" />
                <span>Submit Idea</span>
              </motion.button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">$2.4M</div>
                <div className="text-sm text-gray-400">Total Volume</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <LightBulbSolid className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-gray-400">Active Ideas</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8,932</div>
                <div className="text-sm text-gray-400">Community</div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.8%</div>
                <div className="text-sm text-gray-400">Verified</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Filters */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8 shadow-xl">
          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <SparklesIcon className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search innovative ideas..."
              className="w-full pl-12 pr-6 py-4 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-lg"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-6">
            {IDEAS_CATEGORIES.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {IDEAS_FILTERS.map(filter => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={idea.author.avatar}
                        alt={idea.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{idea.author.name}</span>
                          {idea.author.verified && (
                            <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarSolid className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">{idea.author.reputation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {idea.blockchain.verified && (
                        <div className="p-1 bg-green-500/20 rounded-lg">
                          <LockClosedIcon className="w-4 h-4 text-green-400" />
                        </div>
                      )}
                      {idea.visibility === 'premium' && (
                        <div className="p-1 bg-yellow-500/20 rounded-lg">
                          <StarSolid className="w-4 h-4 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {idea.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium">
                      {idea.category}
                    </span>
                    {idea.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-secondary-700/50 text-gray-300 rounded-lg text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Bidding */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(idea.price, idea.currency)}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">{idea.type}</div>
                    </div>
                    
                    {idea.bidding?.enabled && (
                      <div className="text-right">
                        <div className="text-green-400 font-medium">
                          {formatPrice(idea.bidding.currentBid, idea.currency)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {idea.bidding.bidders} bidders
                        </div>
                      </div>
                    )}
                  </div>

                  {idea.bidding?.enabled && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Live Auction</span>
                        </div>
                        <span className="text-green-400 text-sm">
                          {formatTimeLeft(idea.bidding.endTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-white font-medium">{idea.metrics.views}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{idea.metrics.likes}</div>
                      <div className="text-xs text-gray-400">Likes</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{idea.metrics.rating}</div>
                      <div className="text-xs text-gray-400">Rating</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-medium">{idea.metrics.potential}</div>
                      <div className="text-xs text-gray-400">Potential</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between pt-4 border-t border-secondary-700/50">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(idea.id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <HeartIcon className="w-5 h-5" />
                        <span className="text-sm">{idea.metrics.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span className="text-sm">{idea.metrics.comments}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                        <EyeIcon className="w-5 h-5" />
                        <span className="text-sm">{idea.metrics.views}</span>
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        idea.bidding?.enabled
                          ? 'bg-green-500 hover:bg-green-400 text-white'
                          : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }`}
                    >
                      {idea.bidding?.enabled ? 'Place Bid' : 'View Details'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-16">
            <LightBulbIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No ideas found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or submit a new idea
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitIdea}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-400 hover:to-blue-400 transition-all duration-200 flex items-center space-x-3 font-medium mx-auto"
            >
              <LightBulbSolid className="w-6 h-6" />
              <span>Submit First Idea</span>
            </motion.button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default IdeasPage;