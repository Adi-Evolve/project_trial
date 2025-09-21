import React, { useState } from 'react';
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

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
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

  // Mock user data - this would come from your auth context or API
  const user = {
    id: '1',
    username: 'john_creator',
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer passionate about creating innovative solutions. Love working on AI/ML projects and building scalable web applications.',
    location: 'San Francisco, CA',
    website: 'https://johnsmith.dev',
    company: 'TechCorp Inc.',
    education: 'Stanford University - Computer Science',
    joinedDate: '2023-01-15',
    coverPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'Python', level: 75 },
      { name: 'Machine Learning', level: 70 },
      { name: 'UI/UX Design', level: 65 }
    ],
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/johnsmith', username: 'johnsmith' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/johnsmith', username: 'johnsmith' },
      { platform: 'Twitter', url: 'https://twitter.com/johnsmith', username: '@johnsmith' }
    ],
    stats: {
      projectsCreated: 12,
      ideasShared: 28,
      upvotesReceived: 1247,
      followers: 342,
      following: 156,
      reputation: 4856,
      totalViews: 15420,
      collaborations: 23
    },
    badges: [
      { name: 'Early Adopter', icon: '🚀', description: 'Joined in the first month', earned: '2023-01-15' },
      { name: 'Idea Machine', icon: '💡', description: 'Shared 25+ ideas', earned: '2023-03-20' },
      { name: 'Community Favorite', icon: '❤️', description: '1000+ upvotes received', earned: '2023-06-15' },
      { name: 'Collaborator', icon: '🤝', description: 'Joined 10+ projects', earned: '2023-08-10' },
      { name: 'Mentor', icon: '🎓', description: 'Helped 50+ developers', earned: '2023-09-01' },
      { name: 'Open Source Hero', icon: '⭐', description: 'Contributed to 10+ repos', earned: '2023-09-15' }
    ]
  };

  const myProjects = [
    {
      id: '1',
      title: 'AI Code Assistant',
      description: 'An intelligent coding assistant powered by machine learning',
      category: 'AI/ML',
      status: 'Active',
      upvotes: 234,
      comments: 45,
      views: 1250,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Sustainable Energy Tracker',
      description: 'Mobile app for tracking renewable energy consumption',
      category: 'Environment',
      status: 'Completed',
      upvotes: 189,
      comments: 32,
      views: 890,
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Local Community Hub',
      description: 'Platform connecting neighbors for local services and events',
      category: 'Social',
      status: 'In Progress',
      upvotes: 156,
      comments: 28,
      views: 675,
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=200&fit=crop'
    }
  ];

  const bookmarkedProjects = [
    {
      id: '4',
      title: 'Quantum Computing Simulator',
      description: 'Educational tool for understanding quantum computing principles',
      category: 'Education',
      author: 'Dr. Alice Chen',
      upvotes: 892,
      bookmarkedAt: '2023-09-10',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop'
    },
    {
      id: '5',
      title: 'Climate Data Visualization',
      description: 'Interactive dashboard for climate change data',
      category: 'Environment',
      author: 'Green Tech Team',
      upvotes: 567,
      bookmarkedAt: '2023-09-08',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&h=200&fit=crop'
    },
    {
      id: '6',
      title: 'Blockchain Voting System',
      description: 'Secure and transparent voting using blockchain technology',
      category: 'Blockchain',
      author: 'CryptoVote',
      upvotes: 734,
      bookmarkedAt: '2023-09-05',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop'
    }
  ];

  const userNotifications = [
    {
      id: '1',
      type: 'project_liked',
      title: 'Your project received a new like',
      message: 'Sarah Chen liked "AI Code Assistant"',
      time: '2 hours ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      type: 'follower',
      title: 'New follower',
      message: 'Emma Davis started following you',
      time: '5 hours ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '3',
      type: 'comment',
      title: 'New comment on your project',
      message: 'Mike Johnson commented on "Sustainable Energy Tracker"',
      time: '1 day ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '4',
      type: 'badge',
      title: 'Achievement unlocked!',
      message: 'You earned the "Open Source Hero" badge',
      time: '2 days ago',
      read: true,
      avatar: null
    },
    {
      id: '5',
      type: 'collaboration',
      title: 'Collaboration invitation',
      message: 'TechCorp invited you to join "Smart City Platform"',
      time: '3 days ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop'
    }
  ];

  const recentActivity = [
    {
      type: 'project_liked',
      user: 'Sarah Chen',
      target: 'AI Code Assistant',
      time: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=40&h=40&fit=crop&crop=face'
    },
    {
      type: 'comment',
      user: 'Mike Johnson',
      target: 'Sustainable Energy Tracker',
      comment: 'This is exactly what we need for our office!',
      time: '5 hours ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      type: 'follow',
      user: 'Emma Davis',
      time: '1 day ago',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      type: 'project_shared',
      user: 'Alex Rodriguez',
      target: 'Local Community Hub',
      time: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', count: null, icon: ChartBarIcon },
    { id: 'projects', name: 'Projects', count: user.stats.projectsCreated, icon: FolderIcon },
    { id: 'bookmarks', name: 'Bookmarks', count: bookmarkedProjects.length, icon: BookmarkIcon },
    { id: 'activity', name: 'Activity', count: null, icon: ClockIcon },
    { id: 'notifications', name: 'Notifications', count: userNotifications.filter(n => !n.read).length, icon: BellIcon },
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
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      website: user.website,
      company: user.company,
      education: user.education
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
              {user.coverPhoto && (
                <img
                  src={user.coverPhoto}
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
                  src={user.avatar}
                  alt={user.fullName}
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
                    <h1 className="text-3xl font-bold text-white mb-2">{user.fullName}</h1>
                    <p className="text-lg text-secondary-300">@{user.username}</p>
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
                <p className="mt-4 text-secondary-200 max-w-2xl">{user.bio}</p>

                {/* Quick Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-300">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={user.website} className="text-primary-400 hover:text-primary-300">
                      {user.website}
                    </a>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-3 flex space-x-3">
                  {user.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-400 hover:text-primary-400 transition-colors"
                      title={`${link.platform}: ${link.username}`}
                    >
                      <span className="text-sm">{link.platform}</span>
                    </a>
                  ))}
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
            { label: 'Projects', value: user.stats.projectsCreated, icon: TrophyIcon, color: 'text-blue-400' },
            { label: 'Ideas', value: user.stats.ideasShared, icon: FireIcon, color: 'text-orange-400' },
            { label: 'Upvotes', value: user.stats.upvotesReceived.toLocaleString(), icon: HeartIcon, color: 'text-red-400' },
            { label: 'Followers', value: user.stats.followers, icon: UsersIcon, color: 'text-green-400' },
            { label: 'Following', value: user.stats.following, icon: UserCircleIcon, color: 'text-purple-400' },
            { label: 'Reputation', value: user.stats.reputation.toLocaleString(), icon: StarIcon, color: 'text-yellow-400' },
            { label: 'Views', value: user.stats.totalViews.toLocaleString(), icon: EyeIcon, color: 'text-indigo-400' },
            { label: 'Collaborations', value: user.stats.collaborations, icon: UsersIcon, color: 'text-pink-400' }
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
            <span className="text-sm text-secondary-400">{user.badges.length} badges earned</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.badges.map((badge, index) => (
              <motion.div
                key={badge.name}
                whileHover={{ scale: 1.05 }}
                className="glass-light rounded-lg p-4 relative"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{badge.name}</h3>
                    <p className="text-sm text-secondary-400 mb-1">{badge.description}</p>
                    <span className="text-xs text-secondary-500">
                      Earned {new Date(badge.earned).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
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
                    {myProjects.slice(0, 3).map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02 }}
                        className="glass-light rounded-lg p-4 flex items-center space-x-4"
                      >
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{project.title}</h4>
                          <p className="text-sm text-secondary-400 line-clamp-2">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                            <span className="flex items-center space-x-1">
                              <HeartIcon className="w-3 h-3" />
                              <span>{project.upvotes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ChatBubbleLeftIcon className="w-3 h-3" />
                              <span>{project.comments}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="w-3 h-3" />
                              <span>{project.views}</span>
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
                  <div className="space-y-4">
                    {user.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-secondary-300 font-medium">{skill.name}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-secondary-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-secondary-400 text-sm w-8">{skill.level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.05 }}
                  className="glass rounded-xl overflow-hidden"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-400">{project.category}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-secondary-400 mb-4 line-clamp-2">{project.description}</p>
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
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Bookmarked Projects</h3>
                <span className="text-sm text-secondary-400">{bookmarkedProjects.length} projects saved</span>
              </div>
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
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">All Activity</h3>
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
              <div className="space-y-4">
                {userNotifications.map((notification) => (
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
                      defaultValue={user.fullName}
                      value={isEditing ? formData.fullName : user.fullName}
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
                      value={isEditing ? formData.username : user.username}
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
                      value={isEditing ? formData.email : user.email}
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
                      value={isEditing ? formData.phone : user.phone}
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
                      value={isEditing ? formData.bio : user.bio}
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
                      value={isEditing ? formData.company : user.company}
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
                      value={isEditing ? formData.education : user.education}
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
                      value={isEditing ? formData.website : user.website}
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
                      value={isEditing ? formData.location : user.location}
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