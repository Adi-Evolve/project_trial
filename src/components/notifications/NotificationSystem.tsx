import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  HeartIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface NotificationSystemProps {
  userId: string;
  className?: string;
}

interface Notification {
  id: string;
  type: 'funding' | 'engagement' | 'social' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: {
    amount?: number;
    projectId?: string;
    userId?: string;
    count?: number;
  };
}

interface NotificationPreferences {
  email: {
    funding: boolean;
    engagement: boolean;
    social: boolean;
    system: boolean;
    security: boolean;
  };
  push: {
    funding: boolean;
    engagement: boolean;
    social: boolean;
    system: boolean;
    security: boolean;
  };
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId, className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      funding: true,
      engagement: true,
      social: true,
      system: true,
      security: true
    },
    push: {
      funding: true,
      engagement: false,
      social: true,
      system: true,
      security: true
    },
    frequency: 'instant',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'funding' | 'engagement' | 'social' | 'system'>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time notification listener
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'funding',
          title: 'New Backer!',
          message: 'Sarah Chen just backed your project "AI Learning Platform" with $500',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          actionUrl: '/projects/ai-learning-platform',
          actionText: 'View Project',
          metadata: { amount: 500, projectId: 'ai-learning-platform', userId: 'sarah-chen' }
        },
        {
          id: '2',
          type: 'engagement',
          title: 'Project Liked',
          message: 'Your project received 25 new likes in the past hour',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          metadata: { count: 25, projectId: 'ai-learning-platform' }
        },
        {
          id: '3',
          type: 'social',
          title: 'New Follower',
          message: 'Alex Rodriguez started following you',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low',
          actionUrl: '/profile/alex-rodriguez',
          actionText: 'View Profile',
          metadata: { userId: 'alex-rodriguez' }
        },
        {
          id: '4',
          type: 'funding',
          title: 'Funding Goal Reached!',
          message: 'Congratulations! Your project "Smart Garden Kit" has reached 100% of its funding goal',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'urgent',
          actionUrl: '/projects/smart-garden-kit',
          actionText: 'Celebrate',
          metadata: { projectId: 'smart-garden-kit' }
        },
        {
          id: '5',
          type: 'system',
          title: 'Profile Verification Complete',
          message: 'Your identity verification has been approved. You now have a verified badge!',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'medium'
        },
        {
          id: '6',
          type: 'engagement',
          title: 'New Comment',
          message: 'Mike Johnson commented on your project: "This looks amazing! When will it be available?"',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: '/projects/ai-learning-platform#comments',
          actionText: 'Reply',
          metadata: { userId: 'mike-johnson' }
        },
        {
          id: '7',
          type: 'security',
          title: 'New Login Detected',
          message: 'Someone logged into your account from a new device in San Francisco, CA',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'high',
          actionUrl: '/settings/security',
          actionText: 'Review Security'
        }
      ];
      
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (filter === 'unread') {
      filtered = notifications.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = notifications.filter(n => n.type === filter);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'funding': return CurrencyDollarIcon;
      case 'engagement': return HeartIcon;
      case 'social': return UserPlusIcon;
      case 'system': return InformationCircleIcon;
      case 'security': return ExclamationTriangleIcon;
      default: return BellIcon;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return 'border-red-500/50 bg-red-500/10';
    
    switch (type) {
      case 'funding': return 'border-green-500/50 bg-green-500/10';
      case 'engagement': return 'border-pink-500/50 bg-pink-500/10';
      case 'social': return 'border-blue-500/50 bg-blue-500/10';
      case 'system': return 'border-purple-500/50 bg-purple-500/10';
      case 'security': return 'border-orange-500/50 bg-orange-500/10';
      default: return 'border-secondary-600/50 bg-secondary-700/30';
    }
  };

  const getPriorityIndicator = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'w-3 h-3 bg-red-500 rounded-full';
      case 'high': return 'w-3 h-3 bg-orange-500 rounded-full';
      case 'medium': return 'w-3 h-3 bg-yellow-500 rounded-full';
      case 'low': return 'w-3 h-3 bg-green-500 rounded-full';
      default: return 'w-3 h-3 bg-gray-500 rounded-full';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative p-2 bg-blue-500/20 rounded-lg">
              <BellIcon className="w-6 h-6 text-blue-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-secondary-400">Stay updated with your projects and connections</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors"
            >
              <FunnelIcon className="w-5 h-5 text-white" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-sm"
              >
                Mark All Read
              </button>
            )}
            
            <button
              onClick={clearAllNotifications}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <TrashIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: `Unread (${unreadCount})` },
            { value: 'funding', label: 'Funding' },
            { value: 'engagement', label: 'Engagement' },
            { value: 'social', label: 'Social' },
            { value: 'system', label: 'System' },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences Panel */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-secondary-700/50 p-6 bg-secondary-700/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.email).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          email: { ...prev.email, [key]: e.target.checked }
                        }))}
                        className="rounded border-secondary-600 bg-secondary-700 text-primary-600"
                      />
                      <span className="text-secondary-300 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Push Notifications</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.push).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          push: { ...prev.push, [key]: e.target.checked }
                        }))}
                        className="rounded border-secondary-600 bg-secondary-700 text-primary-600"
                      />
                      <span className="text-secondary-300 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center space-x-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Frequency</label>
                <select
                  value={preferences.frequency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="instant">Instant</option>
                  <option value="hourly">Hourly Digest</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: e.target.checked }
                    }))}
                    className="rounded border-secondary-600 bg-secondary-700 text-primary-600"
                  />
                  <span className="text-secondary-300">Enable Quiet Hours</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-secondary-400">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-white mb-2">No Notifications</h4>
            <p className="text-secondary-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-700/50">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-secondary-700/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary-500/5' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type, notification.priority)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${notification.read ? 'text-secondary-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                            <div className={getPriorityIndicator(notification.priority)} />
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-secondary-400' : 'text-secondary-300'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-xs text-secondary-500">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            {notification.actionText && (
                              <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                                {notification.actionText}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-secondary-600 rounded transition-colors"
                            >
                              <CheckIcon className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-secondary-600 rounded transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;