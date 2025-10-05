import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  Cog6ToothIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'collaboration' | 'funding' | 'project_update' | 'idea_protected' | 'system' | 'achievement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  user?: {
    name: string;
    avatar: string;
  };
  project?: {
    title: string;
    image?: string;
  };
  priority: 'low' | 'normal' | 'high';
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace with your Supabase fetching logic
        // Example:
        // const { data: notificationsData } = await supabase.from('notifications').select('*');
        // setNotifications(notificationsData || []);
        setNotifications([]); // Empty for now, implement real fetch
      } catch (error) {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = notifications.filter(notification => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !notification.isRead;
      if (selectedFilter === 'read') return notification.isRead;
      return notification.type === selectedFilter;
    });
    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter]);

  const getNotificationIcon = (type: string, priority: string) => {
    const baseClasses = "w-5 h-5";
    const priorityColors = {
      low: "text-gray-500",
      normal: "text-blue-500",
      high: "text-red-500"
    };

    const iconColor = priorityColors[priority as keyof typeof priorityColors] || "text-blue-500";

    switch (type) {
      case 'like':
        return <HeartIcon className={`${baseClasses} ${iconColor}`} />;
      case 'comment':
        return <ChatBubbleLeftIcon className={`${baseClasses} ${iconColor}`} />;
      case 'follow':
        return <UserPlusIcon className={`${baseClasses} ${iconColor}`} />;
      case 'collaboration':
        return <UserPlusIcon className={`${baseClasses} ${iconColor}`} />;
      case 'funding':
        return <CurrencyDollarIcon className={`${baseClasses} ${iconColor}`} />;
      case 'project_update':
        return <RocketLaunchIcon className={`${baseClasses} ${iconColor}`} />;
      case 'idea_protected':
        return <LightBulbIcon className={`${baseClasses} ${iconColor}`} />;
      case 'achievement':
        return <CheckCircleIcon className={`${baseClasses} ${iconColor}`} />;
      case 'system':
        return <InformationCircleIcon className={`${baseClasses} ${iconColor}`} />;
      default:
        return <BellIcon className={`${baseClasses} ${iconColor}`} />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: false } : notification
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    setMarkingAllRead(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterOptions = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read', count: notifications.length - unreadCount },
    { id: 'like', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
    { id: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { id: 'collaboration', label: 'Collaboration', count: notifications.filter(n => n.type === 'collaboration').length },
    { id: 'funding', label: 'Funding', count: notifications.filter(n => n.type === 'funding').length },
    { id: 'follow', label: 'Followers', count: notifications.filter(n => n.type === 'follow').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <BellSolidIcon className="w-8 h-8 text-blue-600 mr-3" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-3 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your projects and collaborations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={markAllAsRead}
                disabled={markingAllRead || unreadCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {markingAllRead ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                <span>Mark All Read</span>
              </button>
              <Link
                to="/settings"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4 overflow-x-auto">
            <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFilter(option.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === option.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedFilter === 'all' 
                ? "You're all caught up! No new notifications."
                : `No ${selectedFilter} notifications found.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                  notification.isRead
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                } ${
                  notification.priority === 'high' ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${
                    notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${
                          notification.isRead 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          notification.isRead 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead ? (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Mark as read"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Mark as unread"
                          >
                            <BellIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* User/Project Info */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {notification.user && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={notification.user.avatar}
                              alt={notification.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {notification.user.name}
                            </span>
                          </div>
                        )}
                        {notification.project && !notification.user && (
                          <div className="flex items-center space-x-2">
                            {notification.project.image && (
                              <img
                                src={notification.project.image}
                                alt={notification.project.title}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {notification.project.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            {notification.actionText || 'View'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;