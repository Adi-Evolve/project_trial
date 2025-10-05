import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  PlusIcon,
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
import { supabase, STORAGE_BUCKETS } from '../services/supabase';
import { logAction } from '../services/auditLogs';
import { createNotification } from '../services/integrations';
import GoogleDriveService from '../services/googleDriveService';

// Reviewer Application Modal
const ReviewerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">Apply to be a Reviewer</h2>
        <p className="text-gray-600 mb-4 text-sm">Enter your official email. Admin will review your application.</p>
        <input
          type="email"
          className="input-primary w-full mb-4"
          placeholder="your.official@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={submitting}
        />
        <div className="flex justify-end space-x-2">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="btn-primary"
            disabled={submitting || !email}
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(email);
              setSubmitting(false);
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user: currentUser, updateUser } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<any[]>([]);
  const [userNotificationsData, setUserNotificationsData] = useState<any[]>([]);
  const [showAvatar, setShowAvatar] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    company: '',
    role: '',
    skills: '',
    education: '',
    experience: '',
    github: '',
    linkedin: '',
    twitter: ''
  });
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

  // Reviewer application modal state
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [reviewerRequested, setReviewerRequested] = useState(false);

  // Handle reviewer application
  const handleReviewerApplication = async (email: string) => {
    try {
      const { error } = await supabase.from('reviewer_applications').insert([
        {
          user_id: userData?.id || currentUser?.id,
          email,
          submitted_at: new Date().toISOString(),
          status: 'pending'
        }
      ]);
      if (error) {
        toast.error('Failed to submit application. Please try again.');
        return;
      }
      setReviewerRequested(true);
      toast.success('Application submitted! Admin will review your request.');
      setReviewerModalOpen(false);
    } catch (error) {
      console.error('Reviewer application error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  // Handle file uploads
  const handleAvatarUpload = async (file: File) => {
    try {
      toast.loading('Uploading avatar...');
      
      // Upload to Google Drive (placeholder implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss();
      toast.success('Avatar upload - coming soon');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Avatar upload failed');
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      toast.loading('Uploading cover photo...');
      
      // Upload to Google Drive (placeholder implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss();
      toast.success('Cover photo upload - coming soon');
    } catch (err) {
      console.error('Cover upload error:', err);
      toast.error('Cover upload failed');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', count: null, icon: ChartBarIcon },
    { id: 'projects', name: 'Projects', count: userProjects?.length || 0, icon: FolderIcon },
    { id: 'bookmarks', name: 'Bookmarks', count: bookmarkedProjects?.length || 0, icon: BookmarkIcon },
    { id: 'activity', name: 'Activity', count: null, icon: ClockIcon },
    { id: 'notifications', name: 'Notifications', count: userNotificationsData?.filter((n: any) => !n.read)?.length || 0, icon: BellIcon },
    { id: 'settings', name: 'Settings', count: null, icon: Cog6ToothIcon }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev: any) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updateData = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        role: formData.company
      };
      
      const id = userData?.id || currentUser?.id;
      if (!id) {
        toast.error('User not found');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Profile update error:', error);
        toast.error('Failed to update profile');
        return;
      }

      // Update user data
      const { data: refreshed } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (refreshed) {
        setUserData(refreshed);
        if (updateUser) {
          updateUser({
            ...currentUser,
            ...refreshed
          });
        }
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = () => {
    setFormData({
      fullName: currentUser?.fullName || currentUser?.name || userData?.full_name || '',
      username: currentUser?.username || userData?.username || '',
      email: currentUser?.email || userData?.email || '',
      bio: currentUser?.bio || userData?.bio || '',
      website: userData?.website || '',
      location: userData?.location || '',
      company: userData?.role || '',
      role: '',
      skills: '',
      education: '',
      experience: '',
      github: '',
      linkedin: '',
      twitter: ''
    });
    setIsEditing(true);
  };

  // Mock notifications functions
  const markAllNotificationsAsRead = () => {
    toast.success('All notifications marked as read');
  };

  const markNotificationAsRead = (id: string) => {
    toast.success('Notification marked as read');
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (data && !error) {
            setUserData(data);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-white hover:bg-opacity-30"
              onClick={handleStartEditing}
            >
              <PencilIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold">
                  {currentUser?.name?.[0] || currentUser?.email?.[0] || 'U'}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleAvatarUpload(file);
                    };
                    input.click();
                  }}
                >
                  <CameraIcon className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  {userData?.full_name || currentUser?.name || 'User Profile'}
                </h1>
                <p className="text-secondary-600 mb-2">
                  @{userData?.username || currentUser?.username || 'username'}
                </p>
                <p className="text-secondary-700">
                  {userData?.bio || 'No bio available'}
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {!reviewerRequested && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center space-x-2"
                    onClick={() => setReviewerModalOpen(true)}
                  >
                    <StarIcon className="w-4 h-4" />
                    <span>Become Reviewer</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-secondary-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    className={`px-6 py-4 flex items-center space-x-2 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {tab.count !== null && (
                      <span className="bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-secondary-900">Profile Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 font-medium">Projects</p>
                        <p className="text-2xl font-bold text-blue-900">{userProjects.length}</p>
                      </div>
                      <FolderIcon className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 font-medium">Bookmarks</p>
                        <p className="text-2xl font-bold text-green-900">{bookmarkedProjects.length}</p>
                      </div>
                      <BookmarkIcon className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 font-medium">Notifications</p>
                        <p className="text-2xl font-bold text-purple-900">{userNotificationsData.length}</p>
                      </div>
                      <BellIcon className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-secondary-900">My Projects</h2>
                <div className="text-center py-12">
                  <FolderIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No projects yet</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn-primary mt-4"
                    onClick={() => window.location.href = '/create-project'}
                  >
                    Create Your First Project
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-secondary-900">Settings</h2>
                
                {/* Notification Settings */}
                <div className="bg-secondary-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-secondary-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-primary-600' : 'bg-secondary-300'
                          }`}
                          onClick={() => handleNotificationChange(key, !value)}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-secondary-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    {Object.entries(privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-secondary-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-primary-600' : 'bg-secondary-300'
                          }`}
                          onClick={() => handlePrivacyChange(key, !value)}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Edit Form */}
                {isEditing && (
                  <div className="bg-secondary-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Edit Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="input-primary"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          className="input-primary"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          className="input-primary"
                          rows={3}
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        className="btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tab contents would go here */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-secondary-900">Notifications</h2>
                  <button
                    className="btn-secondary"
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark All as Read
                  </button>
                </div>
                <div className="text-center py-12">
                  <BellIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No notifications</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviewer Application Modal */}
      <ReviewerModal
        open={reviewerModalOpen}
        onClose={() => setReviewerModalOpen(false)}
        onSubmit={handleReviewerApplication}
      />
    </div>
  );
};

export default ProfilePage;