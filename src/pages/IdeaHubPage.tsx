import React, { useState, useEffect } from 'react';
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
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          users!ideas_creator_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          ),
          votes(vote_type, user_id),
          comments(id)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ideas:', error);
        toast.error('Failed to load ideas');
        return;
      }

      // Transform the data to match our Idea interface
      const transformedIdeas: Idea[] = data?.map(idea => {
        const upvotes = idea.votes?.filter((v: any) => v.vote_type === 'up').length || 0;
        const commentsCount = idea.comments?.length || 0;
        const isLiked = user ? idea.votes?.some((vote: any) => vote.user_id === user.id && vote.vote_type === 'up') || false : false;

        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          complexity: idea.complexity || 'Intermediate',
          timeEstimate: idea.time_estimate || '2-6 months',
          author: {
            id: idea.users?.id || idea.creator_id,
            name: idea.users?.full_name || idea.users?.username || 'Unknown',
            avatar: idea.users?.avatar_url || '',
            reputation: idea.users?.reputation_score || 0
          },
          upvotes,
          comments: commentsCount,
          views: idea.view_count || 0,
          shares: 0, // Would need separate tracking
          bookmarks: 0, // Would need separate tracking
          tags: idea.tags || [],
          createdDate: idea.created_at,
          lastUpdated: idea.updated_at,
          status: idea.project_status || 'Open',
          isLiked,
          isBookmarked: false, // Would need separate bookmarks table
          collaborators: 0, // Would need to count from a collaborators table
          requiredSkills: idea.required_skills || [],
          lookingFor: idea.looking_for || []
        };
      }) || [];

      setIdeas(transformedIdeas);
      
    } catch (error) {
      console.error('Error in loadIdeas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteIdea = async (ideaId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please log in to vote on ideas');
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('idea_id', ideaId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating vote:', error);
          toast.error('Failed to update vote');
          return;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            idea_id: ideaId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) {
          console.error('Error creating vote:', error);
          toast.error('Failed to vote');
          return;
        }
      }

      // Reload ideas to get updated vote counts
      await loadIdeas();
      
    } catch (error) {
      console.error('Error in handleVoteIdea:', error);
      toast.error('Failed to vote');
    }
  };



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