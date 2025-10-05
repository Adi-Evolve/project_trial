import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  LockClosedIcon,
  UserIcon,
  RectangleGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  sub_role?: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  aadhar_card_file_id?: string;
  pan_card_file_id?: string;
  ngo_certificate_file_id?: string;
  company_paper_file_id?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  status: string;
  funding_goal: number;
  current_funding: number;
  created_at: string;
  creator_name?: string;
}

interface ReviewerApplication {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  expertise_areas: string[];
  experience_years: number;
  qualifications: string;
  status: string;
  applied_at: string;
}

interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  verifiedUsers: number;
  totalProjects: number;
  activeProjects: number;
  pendingReviewers: number;
  totalFunding: number;
}

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingUsers: 0,
    verifiedUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    pendingReviewers: 0,
    totalFunding: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewerApplications, setReviewerApplications] = useState<ReviewerApplication[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Check if admin is remembered
    const remembered = localStorage.getItem('admin_remembered');
    if (remembered === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      // Set up real-time subscriptions for notifications
      setupNotifications();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'Meinhuadi@1';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      
      if (rememberMe) {
        localStorage.setItem('admin_remembered', 'true');
      }
      
      toast.success('Welcome to Admin Dashboard');
      loadDashboardData();
    } else {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_remembered');
    setPassword('');
    toast.success('Logged out successfully');
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadProjects(),
        loadReviewerApplications()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load user stats
      const { data: allUsers } = await supabase.from('users').select('status, is_verified');
      const { data: allProjects } = await supabase.from('projects').select('status, funding_goal, current_funding');
      const { data: pendingReviewers } = await supabase.from('reviewer_applications').select('status').eq('status', 'pending');

      const totalUsers = allUsers?.length || 0;
      const pendingUsers = allUsers?.filter(u => u.status === 'pending').length || 0;
      const verifiedUsers = allUsers?.filter(u => u.is_verified).length || 0;
      
      const totalProjects = allProjects?.length || 0;
      const activeProjects = allProjects?.filter(p => p.status === 'active').length || 0;
      
      const totalFunding = allProjects?.reduce((sum, p) => sum + (p.current_funding || 0), 0) || 0;

      setStats({
        totalUsers,
        pendingUsers,
        verifiedUsers,
        totalProjects,
        activeProjects,
        pendingReviewers: pendingReviewers?.length || 0,
        totalFunding
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          users!projects_creator_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const projectsWithCreatorName = data?.map(project => ({
        ...project,
        creator_name: project.users?.name || 'Unknown'
      })) || [];
      
      setProjects(projectsWithCreatorName);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadReviewerApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('reviewer_applications')
        .select(`
          *,
          users!reviewer_applications_user_id_fkey(name, email)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      const applicationsWithUserInfo = data?.map(app => ({
        ...app,
        user_name: app.users?.name || 'Unknown',
        user_email: app.users?.email || 'Unknown'
      })) || [];
      
      setReviewerApplications(applicationsWithUserInfo);
    } catch (error) {
      console.error('Error loading reviewer applications:', error);
    }
  };

  const setupNotifications = () => {
    // Subscribe to new reviewer applications
    const reviewerSubscription = supabase
      .channel('reviewer_applications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reviewer_applications'
      }, (payload) => {
        setNotifications(prev => [
          ...prev,
          `New reviewer application from ${payload.new.user_name || 'Unknown'}`
        ]);
        loadReviewerApplications();
        loadStats();
      })
      .subscribe();

    // Subscribe to new user registrations
    const userSubscription = supabase
      .channel('users')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'users'
      }, (payload) => {
        setNotifications(prev => [
          ...prev,
          `New user registration: ${payload.new.name || 'Unknown'}`
        ]);
        loadUsers();
        loadStats();
      })
      .subscribe();

    return () => {
      reviewerSubscription.unsubscribe();
      userSubscription.unsubscribe();
    };
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'approved',
          is_verified: true 
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('User approved successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error approving user');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('User rejected');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error rejecting user');
    }
  };

  const approveReviewer = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('reviewer_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success('Reviewer approved successfully');
      loadReviewerApplications();
      loadStats();
    } catch (error) {
      console.error('Error approving reviewer:', error);
      toast.error('Error approving reviewer');
    }
  };

  const rejectReviewer = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('reviewer_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success('Reviewer application rejected');
      loadReviewerApplications();
      loadStats();
    } catch (error) {
      console.error('Error rejecting reviewer:', error);
      toast.error('Error rejecting reviewer');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <ShieldCheckIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter password to access admin dashboard</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Access Admin Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">ProjectForge Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
            { id: 'users', name: 'User Management', icon: UserGroupIcon },
            { id: 'projects', name: 'Project Management', icon: RectangleGroupIcon },
            { id: 'reviewers', name: 'Reviewer Applications', icon: DocumentCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <UserIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingUsers}</p>
                    </div>
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
                    </div>
                    <RectangleGroupIcon className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Funding</p>
                      <p className="text-2xl font-bold text-purple-600">₹{stats.totalFunding.toLocaleString()}</p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{user.role}</span>
                            {user.sub_role && (
                              <span className="text-xs text-gray-500 block">({user.sub_role})</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : user.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {user.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approveUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => rejectUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviewers' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Reviewer Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expertise</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reviewerApplications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{application.user_name}</p>
                              <p className="text-sm text-gray-500">{application.user_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {application.experience_years} years
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {application.expertise_areas?.map((area, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              application.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : application.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {application.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approveReviewer(application.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => rejectReviewer(application.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;