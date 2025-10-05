import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  StarIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  FireIcon,
  TrophyIcon,
  EyeIcon,
  HeartIcon,
  FolderIcon,
  UsersIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  ShareIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User } from '../types';

interface UserProfile extends User {
  name: string; // Display name - can be fullName
  joinedAt: string;
  lastActive: string;
  bio: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  expertise: string[];
  interests: string[];
  projects: UserProject[];
  collaborations: UserProject[];
  following: number;
  followers: number;
  isFollowing?: boolean;
  statistics: {
    totalProjects: number;
    totalContributions: number;
    totalViews: number;
    totalLikes: number;
    completionRate: number;
    averageRating: number;
  };
  achievements: Achievement[];
  recentActivity: Activity[];
}

interface UserProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image?: string;
  role: string;
  createdAt: string;
  views: number;
  likes: number;
  isLiked?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

interface Activity {
  id: string;
  type: 'project_created' | 'project_joined' | 'milestone_completed' | 'project_liked' | 'user_followed';
  description: string;
  timestamp: string;
  metadata?: any;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [following, setFollowing] = useState(false);

  const tabs = [
    { id: 'projects', name: 'Projects', count: profile?.statistics.totalProjects || 0 },
    { id: 'collaborations', name: 'Collaborations', count: profile?.statistics.totalContributions || 0 },
    { id: 'achievements', name: 'Achievements', count: profile?.achievements.length || 0 },
    { id: 'activity', name: 'Activity', count: profile?.recentActivity.length || 0 }
  ];

  // TODO: Replace with real Supabase fetch for user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Example: Fetch user profile from Supabase
        // const { data, error } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', userId)
        //   .single();
        // if (error) throw error;
        // setProfile(data as UserProfile);
        // setFollowing(data?.isFollowing || false);
        setProfile(null); // Remove this line after implementing real fetch
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      setFollowing(!following);
      if (profile) {
        setProfile({
          ...profile,
          followers: following ? profile.followers - 1 : profile.followers + 1
        });
      }
      toast.success(following ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      toast.error('Failed to update follow status');
      setFollowing(!following); // Revert on error
    }
  };

  const handleLikeProject = async (projectId: string, isOwn: boolean) => {
    try {
      const projects = isOwn ? profile?.projects : profile?.collaborations;
      const setProjects = isOwn 
        ? (newProjects: UserProject[]) => setProfile(prev => prev ? { ...prev, projects: newProjects } : null)
        : (newProjects: UserProject[]) => setProfile(prev => prev ? { ...prev, collaborations: newProjects } : null);

      if (projects) {
        const updatedProjects = projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                isLiked: !project.isLiked,
                likes: project.isLiked ? project.likes - 1 : project.likes + 1
              }
            : project
        );
        setProjects(updatedProjects);
      }
      
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleShare = () => {
    if (navigator.share && profile) {
      navigator.share({
        title: `${profile.name}'s Profile`,
        text: `Check out ${profile.name}'s profile on ProjectForge`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'rare': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'epic': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user profile you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
                {profile.id === '1' && (
                  <CheckBadgeIconSolid className="absolute bottom-2 right-2 w-8 h-8 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <span className="text-gray-500 dark:text-gray-400">
                    @{profile.username}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                  {profile.bio}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Joined {formatDate(profile.joinedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Active {formatTimeAgo(profile.lastActive)}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Website</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      <span>GitHub</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>LinkedIn</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Follow Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.following}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.followers}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isOwnProfile && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        following
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      <span>{following ? 'Following' : 'Follow'}</span>
                    </motion.button>
                    
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  </>
                )}
                
                {isOwnProfile && (
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                )}
                
                <button
                  onClick={handleShare}
                  className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
                
                {!isOwnProfile && (
                  <button className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <FlagIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.statistics.totalProjects}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.statistics.totalContributions}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Collaborations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <EyeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.statistics.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <HeartIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.statistics.totalLikes}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Likes</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills & Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
                >
                  {project.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          <Link
                            to={`/project/${project.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {project.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.category} • {project.role}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{project.views}</span>
                        </div>
                        <button
                          onClick={() => handleLikeProject(project.id, true)}
                          className="flex items-center space-x-1 hover:text-pink-500 transition-colors"
                        >
                          {project.isLiked ? (
                            <HeartIconSolid className="w-4 h-4 text-pink-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4" />
                          )}
                          <span>{project.likes}</span>
                        </button>
                      </div>
                      <span className="text-xs">
                        {formatTimeAgo(project.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'collaborations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.collaborations.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
                >
                  {project.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          <Link
                            to={`/project/${project.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {project.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.category} • {project.role}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{project.views}</span>
                        </div>
                        <button
                          onClick={() => handleLikeProject(project.id, false)}
                          className="flex items-center space-x-1 hover:text-pink-500 transition-colors"
                        >
                          {project.isLiked ? (
                            <HeartIconSolid className="w-4 h-4 text-pink-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4" />
                          )}
                          <span>{project.likes}</span>
                        </button>
                      </div>
                      <span className="text-xs">
                        {formatTimeAgo(project.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${getRarityColor(achievement.rarity)} border-current`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(achievement.earnedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {profile.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === 'project_created' && <FolderIcon className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'project_joined' && <UsersIcon className="w-5 h-5 text-green-500" />}
                        {activity.type === 'milestone_completed' && <CheckBadgeIcon className="w-5 h-5 text-purple-500" />}
                        {activity.type === 'project_liked' && <HeartIcon className="w-5 h-5 text-pink-500" />}
                        {activity.type === 'user_followed' && <UserPlusIcon className="w-5 h-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;