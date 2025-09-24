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
  LockClosedIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  LightBulbIcon as LightBulbSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { blockchainService } from '../services/blockchain';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for idea submission
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    tags: '',
    price: '',
    currency: 'USD' as 'USD' | 'ETH',
    type: 'collaboration' as 'exclusive' | 'license' | 'collaboration',
    visibility: 'public' as 'public' | 'premium' | 'private'
  });



  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      
      const { data: ideasData, error } = await supabase
        .from('ideas')
        .select(`
          *,
          users!ideas_creator_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            wallet_address,
            reputation_score
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIdeas: Idea[] = ideasData?.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: Array.isArray(idea.tags) ? idea.tags : [],
        author: {
          name: idea.users.username || idea.users.full_name || 'Anonymous',
          avatar: idea.users.avatar_url || '/avatars/default.jpg',
          verified: !!idea.users.wallet_address,
          reputation: idea.users.reputation_score || 0
        },
        price: idea.price || 0,
        currency: (idea.currency as 'ETH' | 'USD') || 'USD',
        type: (idea.type as 'exclusive' | 'license' | 'collaboration') || 'collaboration',
        visibility: (idea.visibility as 'public' | 'premium' | 'private') || 'public',
        blockchain: {
          verified: !!idea.tx_hash,
          txHash: idea.tx_hash || '',
          ipfsHash: idea.metadata_hash || ''
        },
        metrics: {
          views: idea.views || 0,
          likes: idea.likes || 0,
          comments: 0, // Will be loaded separately if needed
          rating: idea.rating || 0,
          potential: Math.min((idea.likes || 0) / 10 + (idea.views || 0) / 100, 10)
        },
        createdAt: idea.created_at,
        status: (idea.status as 'available' | 'sold' | 'pending' | 'draft') || 'available'
      })) || [];

      setIdeas(formattedIdeas);
      setFilteredIdeas(formattedIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

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
    if (!user) {
      toast.error('Please sign in to submit an idea');
      return;
    }
    setShowSubmitModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit an idea');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // First create the idea in the database
      const ideaData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        type: formData.type,
        visibility: formData.visibility,
        creator_id: user.id,
        status: 'published'
      };

      const { data: createdIdea, error: createError } = await supabase
        .from('ideas')
        .insert(ideaData)
        .select()
        .single();

      if (createError) throw createError;

      // Register idea on blockchain for ownership verification
      try {
        const blockchainResult = await blockchainService.registerIdea({
          id: createdIdea.id,
          title: createdIdea.title,
          description: createdIdea.description,
          author: user.id || 'anonymous',
          timestamp: new Date().toISOString(),
          category: createdIdea.category,
          tags: createdIdea.tags
        });

        // Update the idea with blockchain transaction details
        if (blockchainResult) {
          const { error: updateError } = await supabase
            .from('ideas')
            .update({
              tx_hash: blockchainResult.txHash,
              block_number: blockchainResult.blockNumber,
              metadata_hash: blockchainResult.txHash // Using txHash as metadata reference
            })
            .eq('id', createdIdea.id);

          if (updateError) {
            console.error('Failed to update idea with blockchain data:', updateError);
          }

          toast.success('Idea submitted and registered on blockchain!');
        } else {
          toast.success('Idea submitted! (Blockchain registration pending)');
        }
      } catch (blockchainError) {
        console.error('Blockchain registration failed:', blockchainError);
        toast.success('Idea submitted! (Blockchain registration pending)');
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        category: 'Technology',
        tags: '',
        price: '',
        currency: 'USD',
        type: 'collaboration',
        visibility: 'public'
      });
      setShowSubmitModal(false);
      
      // Reload ideas to show the new one
      loadIdeas();

    } catch (error) {
      console.error('Error submitting idea:', error);
      toast.error('Failed to submit idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

      {/* Submit Idea Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-secondary-800 rounded-2xl border border-secondary-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Submit New Idea</h2>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Idea Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your innovative idea title..."
                      maxLength={100}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Describe your idea in detail..."
                      maxLength={1000}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {IDEAS_CATEGORIES.filter(cat => cat !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="AI, Innovation, Tech..."
                    />
                  </div>

                  {/* Price and Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'ETH' })}
                        className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="ETH">ETH</option>
                      </select>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Idea Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="collaboration">Collaboration</option>
                      <option value="license">License</option>
                      <option value="exclusive">Exclusive Sale</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visibility
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as typeof formData.visibility })}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="premium">Premium</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center space-x-4 pt-4">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className={`flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        submitting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:from-purple-400 hover:to-blue-400'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <LightBulbSolid className="w-5 h-5" />
                          <span>Submit Idea</span>
                        </>
                      )}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="px-6 py-3 bg-secondary-700 text-gray-300 rounded-lg font-medium hover:bg-secondary-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeasPage;