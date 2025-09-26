import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import { toast } from 'react-hot-toast';
import { localStorageService } from '../services/localStorage';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { getImageList, getPrimaryImage } from '../utils/image';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  fundingRaised: number;
  deadline: string;
  teamSize: number;
  skillsNeeded: string[];
  createdBy: string;
  createdAt: string;
  status: 'active' | 'funded' | 'expired';
  supporters: string[];
  comments: number;
  likes: number;
  views: number;
  bookmarks: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  trendingScore?: number;
  matchScore?: number;
  creator: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  images?: string[];
  blockchainRecord?: any;
}

const PROJECT_CATEGORIES = [
  'All', 'Technology', 'Healthcare', 'Education', 'Environment', 'Gaming',
  'AI/ML', 'Blockchain', 'IoT', 'Mobile App', 'Web Development',
  'Hardware', 'Research', 'Social Impact', 'Entertainment', 'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'funding', label: 'Most Funded' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'deadline', label: 'Deadline Soon' },
  { value: 'team-size', label: 'Team Size' }
];

const ProjectsPage: React.FC = () => {
  // const { isAuthenticated } = useAuth(); // Will be used for authentication checks later
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'discovery' | 'classic'>('discovery');
  
  // Filter states
  const [filters, setFilters] = useState({
    minFunding: 0,
    maxFunding: 1000000,
    status: 'all',
    hasBlockchain: false,
    teamSizeMin: 1,
    teamSizeMax: 50
  });




  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // Load projects from Supabase
      // Try to load projects with embedded creator user (requires FK relationship projects.creator_id -> users.id)
      let projectsData: any = null;
      let error: any = null;

      try {
        const res = await supabase
          .from('projects')
          .select(`
            *,
            users:creator_id (
              id,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        projectsData = res.data;
        error = res.error;
      } catch (err) {
        // PostgREST may throw for missing FK relationships; handle below
        error = err;
      }

      // If the join failed because the DB doesn't have the FK relationship, fall back to separate queries
      if (error) {
        console.warn('Projects join failed, falling back to separate queries:', error);

        // Fetch projects without the embedded users
        const { data: basicProjects, error: basicError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (basicError) {
          console.error('Error loading projects (basic fetch):', basicError);
          toast.error('Failed to load projects');
          return;
        }

        // Batch-fetch user profiles for the creator_ids we found
        const creatorIds = Array.from(new Set((basicProjects || []).map((p: any) => p.creator_id).filter(Boolean)));
        let usersById: Record<string, any> = {};

        if (creatorIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id,username,avatar_url')
            .in('id', creatorIds as any[]);

          if (!usersError && usersData) {
            usersById = (usersData as any[]).reduce((acc, u) => {
              acc[u.id] = u;
              return acc;
            }, {} as Record<string, any>);
          } else {
            console.warn('Failed to fetch creator profiles for projects:', usersError);
          }
        }

        // Attach user info to each project record so the rest of the UI can work unchanged
        projectsData = (basicProjects || []).map((project: any) => ({
          ...project,
          users: usersById[project.creator_id] || null
        }));
      }

      // Transform the data to match our Project interface
          const transformedProjects: Project[] = (projectsData || []).map((project: any) => {
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          category: project.category || 'General',
          tags: project.tags || [],
          fundingGoal: project.funding_goal || 0,
          fundingRaised: project.funding_raised || 0,
          deadline: project.deadline || '',
          teamSize: project.team_size || 1,
          skillsNeeded: project.skills_needed || [],
          createdBy: project.creator_id,
          createdAt: project.created_at,
          status: (project.status as 'active' | 'funded' | 'expired') || 'active',
          supporters: project.supporters || [],
          comments: project.comment_count || 0,
          likes: project.like_count || 0,
          views: project.view_count || 0,
          bookmarks: project.bookmark_count || 0,
          isLiked: false, // Would need additional query for user-specific data
          isBookmarked: false, // Would need additional query for user-specific data
          creator: {
            id: project.creator_id,
            username: project.users?.username || 'Unknown Creator',
            avatar: project.users?.avatar_url || '',
            verified: false // Could be enhanced with verification system
          },
          images: getImageList(project),
          blockchainRecord: project.blockchain_record ? {
            txHash: project.blockchain_record.tx_hash,
            verified: project.blockchain_record.verified || true,
            blockNumber: project.blockchain_record.block_number,
            timestamp: project.blockchain_record.timestamp
          } : undefined
        };
      });

      // Filter only active projects
      const activeProjects = transformedProjects.filter(p => p.status === 'active');

      setProjects(activeProjects);
      setFilteredProjects(activeProjects);

      if (activeProjects.length === 0) {
        toast.success('📝 No active projects found. Be the first to create one!', { duration: 3000 });
      } else {
        toast.success(`📊 Loaded ${activeProjects.length} active projects successfully!`, { duration: 2000 });
      }

    } catch (error) {
      console.error('Error in loadProjects:', error);
      toast.error('Failed to load projects from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchQuery, selectedCategory, sortBy, filters]);

  const handleLikeProject = async (projectId: string) => {
    if (!user) {
      toast.error('Please log in to like projects');
      return;
    }

    try {

      
      // Get current project
      const currentProject = projects.find(p => p.id === projectId);
      if (!currentProject) {
        toast.error('Project not found');
        return;
      }

      const isCurrentlyLiked = currentProject.isLiked;
      
      // Update local state immediately for responsive UI
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              likes: isCurrentlyLiked ? project.likes - 1 : project.likes + 1, 
              isLiked: !isCurrentlyLiked 
            }
          : project
      ));

      // Update filtered projects as well
      setFilteredProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              likes: isCurrentlyLiked ? project.likes - 1 : project.likes + 1, 
              isLiked: !isCurrentlyLiked 
            }
          : project
      ));

      // For now, just show success message
      // In a full implementation, this would update localStorage with user interactions
      const action = isCurrentlyLiked ? 'unliked' : 'liked';
      toast.success(`Project ${action} successfully! 👍`);
      


    } catch (error) {
      console.error('Error in handleLikeProject:', error);
      toast.error('Failed to update like status');
      
      // Revert the optimistic update on error
      loadProjects();
    }
  };

  const handleRefreshProjects = () => {
    loadProjects();
    toast.success('Projects refreshed');
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query)) ||
        project.creator.username.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Additional filters
    filtered = filtered.filter(project => {
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      if (project.fundingGoal < filters.minFunding || project.fundingGoal > filters.maxFunding) return false;
      if (project.teamSize < filters.teamSizeMin || project.teamSize > filters.teamSizeMax) return false;
      if (filters.hasBlockchain && !project.blockchainRecord) return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'funding':
          return b.fundingRaised - a.fundingRaised;
        case 'popular':
          return b.likes - a.likes;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'team-size':
          return b.teamSize - a.teamSize;
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectCreate = async (newProject: Project) => {
    // Reload projects to get the latest data including the new project
    await loadProjects();
    toast.success('Project created successfully!');
    setShowCreateForm(false);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleComment = (projectId: string) => {
    // Navigate to project detail page with comments section
    toast('Opening project comments...');
  };

  const handleShare = (projectId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${projectId}`);
    toast.success('Project link copied to clipboard!');
  };

  const handleUpvote = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add upvote tracking if needed
          }
        : project
    ));
    toast.success('Project upvoted!');
  };

  const handleDownvote = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add downvote tracking if needed
          }
        : project
    ));
    toast('Project downvoted');
  };

  const handleRate = (projectId: string, rating: number) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add rating logic if needed
          }
        : project
    ));
    toast.success(`Rated ${rating} stars!`);
  };

  const handleBookmark = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            isBookmarked: !project.isBookmarked,
            bookmarks: project.isBookmarked ? project.bookmarks - 1 : project.bookmarks + 1
          }
        : project
    ));
    toast.success('Project bookmarked!');
  };

  // Transform projects for display
  const transformProjectsForDisplay = (projects: Project[]) => {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      author: {
        name: project.creator.username,
        avatar: project.creator.avatar || '/avatars/default.jpg',
        verified: project.creator.verified
      },
      category: project.category,
      tags: project.tags,
      currentAmount: project.fundingRaised,
      targetAmount: project.fundingGoal,
      backers: project.supporters.length,
      daysLeft: Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      images: project.images || ['/projects/default.jpg'],
      createdAt: project.createdAt,
      updatedAt: project.createdAt,
      likes: project.likes,
      views: project.views,
      isLiked: project.isLiked || false,
      isBookmarked: project.isBookmarked || false,
      engagementScore: project.likes + project.views * 0.1 + project.comments * 2,
      comments: [], // Would be populated from actual comments API
      upvotes: Math.floor(project.likes * 1.2), // Mock upvotes
      downvotes: Math.floor(project.likes * 0.1), // Mock downvotes
      rating: 4.2 + Math.random() * 0.8, // Mock rating
      userVote: null as 'up' | 'down' | null,
      userRating: 0
    }));
  };

  const resetFilters = () => {
    setFilters({
      minFunding: 0,
      maxFunding: 1000000,
      status: 'all',
      hasBlockchain: false,
      teamSizeMin: 1,
      teamSizeMax: 50
    });
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center">
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
      <div className="bg-secondary-800/50 backdrop-blur-xl border-b border-secondary-700/50 sticky top-16 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Discover Projects</h1>
              <p className="text-gray-400 text-lg">
                Find innovative projects, collaborate with creators, and bring ideas to life
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 flex items-center space-x-3 font-medium shadow-lg shadow-primary-500/25"
            >
              <PlusIcon className="w-6 h-6" />
              <span>Create Project</span>
            </motion.button>
          </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8 mb-8 shadow-xl">
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tags, or creators..."
              className="w-full pl-12 pr-6 py-4 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 text-lg"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {PROJECT_CATEGORIES.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-gray-300 hover:text-white hover:border-secondary-500 transition-all duration-200"
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>

              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
              
              <button
                onClick={handleRefreshProjects}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                disabled={loading}
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('discovery')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'discovery' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Discovery Feed"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('classic')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'classic' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Classic Grid"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-secondary-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Funding Goal
                    </label>
                    <input
                      type="number"
                      value={filters.minFunding}
                      onChange={(e) => setFilters(prev => ({ ...prev, minFunding: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Funding Goal
                    </label>
                    <input
                      type="number"
                      value={filters.maxFunding}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxFunding: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="funded">Funded</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={filters.hasBlockchain}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasBlockchain: e.target.checked }))}
                        className="rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Blockchain Verified</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Projects Feed */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or create a new project
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 flex items-center space-x-2 font-medium mx-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create First Project</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={project}
                      onLike={handleLikeProject}
                      onComment={handleComment}
                      onShare={handleShare}
                      onClick={handleProjectClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <ProjectForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleProjectCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;