import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  MapPinIcon,
  CalendarDaysIcon,
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  BookmarkIcon,
  FolderIcon,
  ChartBarIcon,
  UsersIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolid,
  HeartIcon as HeartSolid,
  BellIcon as BellSolid,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    projectUpdates: true,
    comments: true,
    followers: false,
    newsletter: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    showProjects: true,
    showActivity: true
  });
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    education: ''
  });

  // Real user data from Supabase
  const [userData, setUserData] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<any[]>([]);
  const [userNotificationsData, setUserNotificationsData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load user data from Supabase
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Load user profile data
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', user?.walletAddress)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user profile:', userError);
        toast.error('Failed to load user profile');
        return;
      }

      if (userProfile) {
        setUserData(userProfile);
        setFormData({
          fullName: userProfile.full_name || '',
          username: userProfile.username || '',
          email: userProfile.email || '',
          phone: '',
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          website: userProfile.website || '',
          company: userProfile.role || '',
          education: ''
        });
      }

      // Load user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', userProfile?.id || user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading user projects:', projectsError);
      } else {
        setUserProjects(projects || []);
      }

      // Load user's bookmarked projects (if bookmarks table exists)
      // For now, we'll use empty array
      setBookmarkedProjects([]);

      // Load user's notifications (if notifications table exists)
      // For now, we'll use empty array
      setUserNotificationsData([]);

      // Load recent activity (if activity table exists)
      // For now, we'll use empty array
      setRecentActivity([]);

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', count: null, icon: ChartBarIcon },
    { id: 'projects', name: 'Projects', count: userProjects.length, icon: FolderIcon },
    { id: 'bookmarks', name: 'Bookmarks', count: bookmarkedProjects.length, icon: BookmarkIcon },
    { id: 'activity', name: 'Activity', count: null, icon: ClockIcon },
    { id: 'notifications', name: 'Notifications', count: userNotificationsData.filter((n: any) => !n.read).length, icon: BellIcon },
    { id: 'settings', name: 'Settings', count: null, icon: Cog6ToothIcon }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_liked':
        return <HeartSolid className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserCircleIcon className="w-4 h-4 text-green-500" />;
      case 'project_shared':
        return <ShareIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <StarIcon className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'project_liked':
        return `${activity.user} liked your project "${activity.target}"`;
      case 'comment':
        return `${activity.user} commented on "${activity.target}": "${activity.comment}"`;
      case 'follow':
        return `${activity.user} started following you`;
      case 'project_shared':
        return `${activity.user} shared your project "${activity.target}"`;
      default:
        return 'Unknown activity';
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setFormData({
      fullName: user?.fullName || user?.name || userData?.full_name || '',
      username: user?.username || userData?.username || '',
      email: user?.email || userData?.email || '',
      phone: '',
      bio: user?.bio || userData?.bio || '',
      location: '',
      website: '',
      company: userData?.role || '',
      education: ''
    });
    setIsEditing(true);
  };

  const markNotificationAsRead = (notificationId: string) => {
    // In a real app, this would update the notification status
    toast.success('Notification marked as read');
  };

  const markAllNotificationsAsRead = () => {
    // In a real app, this would mark all notifications as read
    toast.success('All notifications marked as read');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-xl mb-6 relative overflow-hidden">
              {userData?.cover_photo && (
                <img
                  src={userData.cover_photo}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>
              <button className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors">
                <CameraIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="relative -mt-20 flex flex-col md:flex-row md:items-end md:space-x-8">
              {/* Avatar */}
              <div className="relative mb-4 md:mb-0">
                <img
                  src={userData?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                  alt={userData?.full_name || 'User'}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                <button className="absolute bottom-2 right-2 p-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors shadow-lg">
                  <CameraIcon className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{userData?.full_name || 'Loading...'}</h1>
                    <p className="text-lg text-secondary-300">@{userData?.username || userData?.wallet_address?.slice(0, 10) + '...'}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartEditing}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </motion.button>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-secondary-200 max-w-2xl">{userData?.bio || 'No bio available'}</p>

                {/* Quick Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-300">
                  {userData?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{userData.location}</span>
                    </div>
                  )}
                  {userData?.website && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={userData.website} className="text-primary-400 hover:text-primary-300">
                        {userData.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Joined {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>

                {/* Social Links - placeholder for now */}
                <div className="mt-3 flex space-x-3">
                  {userData?.github_profile && (
                    <a
                      href={userData.github_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-400 hover:text-primary-400 transition-colors"
                      title="GitHub"
                    >
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                  {userData?.linkedin_profile && (
                    <a
                      href={userData.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-400 hover:text-primary-400 transition-colors"
                      title="LinkedIn"
                    >
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
        >
          {[
            { label: 'Projects', value: userProjects.length, icon: TrophyIcon, color: 'text-blue-400' },
            { label: 'Ideas', value: 0, icon: FireIcon, color: 'text-orange-400' }, // TODO: Add ideas count
            { label: 'Upvotes', value: userProjects.reduce((sum, p) => sum + (p.like_count || 0), 0), icon: HeartIcon, color: 'text-red-400' },
            { label: 'Followers', value: 0, icon: UsersIcon, color: 'text-green-400' }, // TODO: Add followers count
            { label: 'Following', value: 0, icon: UserCircleIcon, color: 'text-purple-400' }, // TODO: Add following count
            { label: 'Reputation', value: userData?.reputation || 0, icon: StarIcon, color: 'text-yellow-400' },
            { label: 'Views', value: userProjects.reduce((sum, p) => sum + (p.view_count || 0), 0), icon: EyeIcon, color: 'text-indigo-400' },
            { label: 'Collaborations', value: 0, icon: UsersIcon, color: 'text-pink-400' } // TODO: Add collaborations count
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="glass-light rounded-xl p-4 text-center"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-secondary-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Achievements</h2>
            <span className="text-sm text-secondary-400">0 badges earned</span> {/* TODO: Add badges system */}
          </div>
          <div className="text-center py-8 text-secondary-400">
            <TrophyIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No achievements yet. Start creating projects to earn badges!</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-secondary-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-secondary-400 hover:text-secondary-300 hover:border-secondary-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-secondary-700 text-secondary-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
                    <div className="space-y-4">
                      {userProjects.slice(0, 3).map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ scale: 1.02 }}
                          className="glass-light rounded-lg p-4 flex items-center space-x-4"
                        >
                          <img
                            src={project.image_url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop'}
                            alt={project.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{project.title}</h4>
                            <p className="text-sm text-secondary-400 line-clamp-2">{project.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                              <span className="flex items-center space-x-1">
                                <HeartIcon className="w-3 h-3" />
                                <span>{project.like_count || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <ChatBubbleLeftIcon className="w-3 h-3" />
                                <span>{project.comment_count || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <EyeIcon className="w-3 h-3" />
                                <span>{project.view_count || 0}</span>
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'funded' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {project.status}
                          </span>
                        </motion.div>
                      ))}
                      {userProjects.length === 0 && (
                        <div className="text-center py-8 text-secondary-400">
                          <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No projects yet. Create your first project!</p>
                        </div>
                      )}
                    </div>
                  </div>                {/* Skills */}
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
                  <div className="space-y-4">
                    {user && user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-secondary-300 font-medium">{skill}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-secondary-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${75}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
                              />
                            </div>
                            <span className="text-secondary-400 text-sm w-8">75%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-secondary-400 mb-2">
                          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <p className="text-secondary-400">Skills data will be available soon</p>
                        <p className="text-sm text-secondary-500 mt-1">Complete your profile to showcase your expertise</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <img
                          src={activity.avatar}
                          alt={activity.user}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getActivityIcon(activity.type)}
                            <span className="text-xs text-secondary-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-secondary-300">{getActivityText(activity)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-secondary-400 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-secondary-400">No recent activity</p>
                      <p className="text-sm text-secondary-500 mt-1">Your activity will appear here as you use the platform</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects && userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.05 }}
                    className="glass rounded-xl overflow-hidden"
                  >
                    <img
                      src={project.image_url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop'}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-primary-400">{project.category || 'Project'}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'funded' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {project.status || 'Draft'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-secondary-400 mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-secondary-500">
                          <span className="flex items-center space-x-1">
                            <HeartIcon className="w-4 h-4" />
                            <span>{project.like_count || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{project.comment_count || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <EyeIcon className="w-4 h-4" />
                            <span>{project.view_count || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-secondary-400 mb-4">
                    <FolderIcon className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
                  <p className="text-secondary-400 mb-4">Create your first project to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/create-project'}
                    className="btn-primary"
                  >
                    Create Project
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Bookmarked Projects</h3>
                <span className="text-sm text-secondary-400">{bookmarkedProjects.length} projects saved</span>
              </div>
              {bookmarkedProjects && bookmarkedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.05 }}
                      className="glass-light rounded-xl overflow-hidden"
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-primary-400">{project.category}</span>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <BookmarkIcon className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                        <p className="text-secondary-400 mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-500">by {project.author}</span>
                          <div className="flex items-center space-x-1 text-secondary-500">
                            <HeartIcon className="w-4 h-4" />
                            <span>{project.upvotes}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-secondary-500">
                          Saved {new Date(project.bookmarkedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-secondary-400 mb-4">
                    <BookmarkIcon className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No bookmarked projects yet</h3>
                  <p className="text-secondary-400 mb-4">Start exploring projects and save the ones you like</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('projects')}
                    className="btn-primary"
                  >
                    Browse Projects
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">All Activity</h3>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 glass-light rounded-lg">
                      <img
                        src={activity.avatar}
                        alt={activity.user}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {getActivityIcon(activity.type)}
                          <span className="font-medium text-white">{activity.user}</span>
                          <span className="text-sm text-secondary-500">{activity.time}</span>
                        </div>
                        <p className="text-secondary-300">{getActivityText(activity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-secondary-400 mb-4">
                    <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
                  <p className="text-secondary-400 mb-4">Your activity timeline will appear here as you engage with the platform</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('projects')}
                    className="btn-primary"
                  >
                    Create Your First Project
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Mark all as read
                </motion.button>
              </div>
              {userNotificationsData && userNotificationsData.length > 0 ? (
                <div className="space-y-4">
                  {userNotificationsData.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        !notification.read
                          ? 'bg-primary-500/10 border-primary-500'
                          : 'bg-secondary-800/50 border-secondary-600'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white">{notification.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-secondary-500">{notification.time}</span>
                              {!notification.read && (
                                <button
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="text-primary-400 hover:text-primary-300"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-secondary-300 text-sm">{notification.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-secondary-400 mb-4">
                    <BellIcon className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No notifications yet</h3>
                  <p className="text-secondary-400 mb-4">You'll receive notifications about project updates, comments, and more</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('projects')}
                    className="btn-primary"
                  >
                    Explore Projects
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userData?.full_name || ''}
                      value={isEditing ? formData.fullName : (userData?.full_name || '')}
                      onChange={(e) => isEditing && handleFormChange('fullName', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={isEditing ? formData.username : (userData?.username || '')}
                      onChange={(e) => isEditing && handleFormChange('username', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={isEditing ? formData.email : (userData?.email || '')}
                      onChange={(e) => isEditing && handleFormChange('email', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? formData.phone : ''}
                      onChange={(e) => isEditing && handleFormChange('phone', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={isEditing ? formData.bio : (userData?.bio || '')}
                      onChange={(e) => isEditing && handleFormChange('bio', e.target.value)}
                      rows={3}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={isEditing ? formData.company : (userData?.role || '')}
                      onChange={(e) => isEditing && handleFormChange('company', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      value={isEditing ? formData.education : ''}
                      onChange={(e) => isEditing && handleFormChange('education', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={isEditing ? formData.website : (userData?.website || '')}
                      onChange={(e) => isEditing && handleFormChange('website', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={isEditing ? formData.location : (userData?.location || '')}
                      onChange={(e) => isEditing && handleFormChange('location', e.target.value)}
                      className="input-primary"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <BellIcon className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email notifications', description: 'Receive updates via email' },
                    { key: 'push', label: 'Push notifications', description: 'Browser push notifications' },
                    { key: 'projectUpdates', label: 'Project updates', description: 'Updates from projects you follow' },
                    { key: 'comments', label: 'Comments & replies', description: 'When someone comments on your projects' },
                    { key: 'followers', label: 'New followers', description: 'When someone follows you' },
                    { key: 'newsletter', label: 'Newsletter', description: 'Weekly newsletter and platform updates' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 glass-light rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{setting.label}</h4>
                        <p className="text-sm text-secondary-400">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(setting.key, !notifications[setting.key as keyof typeof notifications])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[setting.key as keyof typeof notifications] ? 'bg-primary-500' : 'bg-secondary-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[setting.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'profileVisible', label: 'Public profile', description: 'Make your profile visible to everyone' },
                    { key: 'showEmail', label: 'Show email', description: 'Display your email on your profile' },
                    { key: 'showPhone', label: 'Show phone', description: 'Display your phone number on your profile' },
                    { key: 'showProjects', label: 'Show projects', description: 'Display your projects publicly' },
                    { key: 'showActivity', label: 'Show activity', description: 'Display your recent activity' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 glass-light rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{setting.label}</h4>
                        <p className="text-sm text-secondary-400">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange(setting.key, !privacy[setting.key as keyof typeof privacy])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy[setting.key as keyof typeof privacy] ? 'bg-primary-500' : 'bg-secondary-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy[setting.key as keyof typeof privacy] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Security */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5" />
                  <span>Account Security</span>
                </h3>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 glass-light rounded-lg text-left hover:bg-secondary-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Change Password</h4>
                        <p className="text-sm text-secondary-400">Update your account password</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-secondary-400" />
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 glass-light rounded-lg text-left hover:bg-secondary-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-secondary-400">Add an extra layer of security</p>
                      </div>
                      <span className="text-sm text-yellow-400">Recommended</span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="btn-primary"
                  >
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;