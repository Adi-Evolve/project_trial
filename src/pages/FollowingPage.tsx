import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { getPrimaryImage } from '../utils/image';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  followedAt: string;
  isOnline: boolean;
  stats: {
    projects: number;
    ideas: number;
    followers: number;
    following: number;
  };
  skills: string[];
  recentActivity: {
    type: 'project' | 'idea' | 'comment';
    title: string;
    timestamp: string;
  }[];
  badges: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  stats: {
    likes: number;
    views: number;
    collaborators: number;
  };
  updatedAt: string;
  status: 'active' | 'completed' | 'paused';
}

const FollowingPage: React.FC = () => {
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'people' | 'activity'>('people');
  const [loading, setLoading] = useState(true);

  // Load followed users and recent activity
  useEffect(() => {
    if (user) {
      loadFollowedUsers();
      loadRecentProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFollowedUsers = async () => {
    if (!user) return;

    try {
      // Get users that current user follows
      const { data: followedUsersData, error } = await supabase
        .from('follows')
        .select(`
          followed_at: created_at,
          following_user: following_id (
            id,
            username,
            full_name,
            bio,
            avatar_url,
            location,
            skills,
            reputation_score,
            total_projects,
            created_at
          )
        `)
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error loading followed users:', error);
        toast.error('Failed to load following list');
        return;
      }

      // Get additional stats for each followed user
      const usersWithStats = await Promise.all(
        followedUsersData?.map(async (follow: any) => {
          const followingUser = follow.following_user;
          
          // Get project count
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', followingUser.id);

          // Get idea count
          const { count: ideaCount } = await supabase
            .from('ideas')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', followingUser.id);

          // Get followers count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', followingUser.id);

          // Get following count
          const { count: followingCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', followingUser.id);

          // Get recent activity (projects and ideas)
          const recentActivity = [];
          
          // Get recent projects
          const { data: recentProjects } = await supabase
            .from('projects')
            .select('title, updated_at')
            .eq('creator_id', followingUser.id)
            .order('updated_at', { ascending: false })
            .limit(2);

          if (recentProjects) {
            recentActivity.push(
              ...recentProjects.map(p => ({
                type: 'project' as const,
                title: p.title,
                timestamp: p.updated_at
              }))
            );
          }

          // Get recent ideas
          const { data: recentIdeas } = await supabase
            .from('ideas')
            .select('title, updated_at')
            .eq('creator_id', followingUser.id)
            .order('updated_at', { ascending: false })
            .limit(2);

          if (recentIdeas) {
            recentActivity.push(
              ...recentIdeas.map(i => ({
                type: 'idea' as const,
                title: i.title,
                timestamp: i.updated_at
              }))
            );
          }

          // Sort activity by timestamp
          recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          return {
            id: followingUser.id,
            name: followingUser.full_name || 'Anonymous User',
            username: followingUser.username || `user_${followingUser.id.slice(0, 8)}`,
            avatar: followingUser.avatar_url || '/default-avatar.png',
            bio: followingUser.bio || 'No bio available',
            location: followingUser.location,
            followedAt: follow.followed_at,
            isOnline: Math.random() > 0.5, // Random online status for now
            stats: {
              projects: projectCount || 0,
              ideas: ideaCount || 0,
              followers: followersCount || 0,
              following: followingCount || 0
            },
            skills: followingUser.skills || [],
            recentActivity: recentActivity.slice(0, 2),
            badges: [] // We can implement badges later
          } as User;
        }) || []
      );

      setFollowedUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading followed users:', error);
      toast.error('Failed to load following list');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentProjects = async () => {
    if (!user) return;

    try {
      // Get projects from users that current user follows
      const { data: recentProjectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          image_urls,
          tags,
          updated_at,
          status,
          creator:creator_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .in('creator_id', await getFollowingIds())
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error loading recent projects:', error);
        return;
      }

      const projects = recentProjectsData?.map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        image: getPrimaryImage(project),
        author: {
          name: project.creator?.full_name || 'Anonymous',
          avatar: project.creator?.avatar_url || '/default-avatar.png'
        },
        tags: project.tags || [],
        stats: {
          likes: Math.floor(Math.random() * 200), // We can implement real stats later
          views: Math.floor(Math.random() * 1000),
          collaborators: Math.floor(Math.random() * 10)
        },
        updatedAt: project.updated_at,
        status: project.status as 'active' | 'completed' | 'paused'
      })) || [];

      setRecentProjects(projects);
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  };

  const getFollowingIds = async (): Promise<string[]> => {
    if (!user) return [];
    
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
      
    return data?.map(f => f.following_id) || [];
  };

  const filteredUsers = followedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'online') return matchesSearch && user.isOnline;
    if (selectedFilter === 'active') return matchesSearch && user.recentActivity.length > 0;
    
    return matchesSearch;
  });

  const unfollowUser = async (userId: string) => {
    if (!user) {
      toast.error('Please log in to unfollow users');
      return;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        toast.error('Failed to unfollow user');
        return;
      }

      // Remove user from local state
      setFollowedUsers(followedUsers.filter(u => u.id !== userId));
      toast.success('User unfollowed successfully');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <RocketLaunchIcon className="w-4 h-4" />;
      case 'idea':
        return <LightBulbIcon className="w-4 h-4" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-4 h-4" />;
      default:
        return <SparklesIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your network...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
            Following
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay connected with {followedUsers.length} innovators and their latest projects
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('people')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'people'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                People ({followedUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Recent Activity
              </button>
            </nav>
          </div>
        </motion.div>

        {activeTab === 'people' ? (
          <>
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Filter */}
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All People</option>
                  <option value="online">Online Now</option>
                  <option value="active">Recently Active</option>
                </select>

                {/* View Mode */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 flex items-center justify-center ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 flex items-center justify-center ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* People Grid/List */}
            {filteredUsers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No people found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || selectedFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start following people to see them here!'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`p-6 ${viewMode === 'list' ? 'flex items-center space-x-6 flex-1' : ''}`}>
                      {/* Avatar and Online Status */}
                      <div className={`relative ${viewMode === 'list' ? '' : 'flex justify-center mb-4'}`}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'text-center'}`}>
                        <Link
                          to={`/profile/${user.username}`}
                          className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            @{user.username}
                          </p>
                        </Link>

                        {user.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📍 {user.location}
                          </p>
                        )}

                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                          {user.bio}
                        </p>

                        {/* Skills */}
                        <div className={`mt-3 ${viewMode === 'list' ? 'flex flex-wrap gap-1' : 'flex flex-wrap justify-center gap-1'}`}>
                          {user.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              +{user.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className={`mt-4 grid grid-cols-2 gap-2 text-sm ${viewMode === 'list' ? '' : 'text-center'}`}>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.stats.projects}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">Projects</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.stats.ideas}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">Ideas</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.stats.followers}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">Followers</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.stats.following}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">Following</span>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        {user.recentActivity.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Recent Activity
                            </h4>
                            {user.recentActivity.slice(0, 2).map((activity, i) => (
                              <div key={i} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                {getActivityIcon(activity.type)}
                                <span className="line-clamp-1">{activity.title}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(activity.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex space-x-2">
                          <Link
                            to={`/profile/${user.username}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => unfollowUser(user.id)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Unfollow"
                          >
                            <UserMinusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Follow Date */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          Following since {formatTimeAgo(user.followedAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        ) : (
          /* Recent Activity Tab */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Projects from People You Follow
            </h2>
            
            {recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No recent activity
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  When people you follow create new projects, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    {project.image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(project.updatedAt)}
                        </span>
                      </div>

                      <Link
                        to={`/projects/${project.id}`}
                        className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img
                            src={project.author.avatar}
                            alt={project.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {project.author.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <HeartIcon className="w-3 h-3" />
                            <span>{project.stats.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="w-3 h-3" />
                            <span>{project.stats.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;