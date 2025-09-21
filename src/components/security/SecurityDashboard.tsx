import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FlagIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { analyzeProfileSecurity, analyzeProjectSecurity, SecurityFlags } from '../../utils/security';

interface SecurityDashboardProps {
  className?: string;
}

interface SecurityAlert {
  id: string;
  type: 'profile' | 'project' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  projectId?: string;
  timestamp: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'users' | 'projects'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    verifiedUsers: 890,
    suspiciousProfiles: 23,
    blockedUsers: 12,
    totalProjects: 340,
    flaggedProjects: 8,
    resolvedAlerts: 156,
    activeThreats: 5
  });

  useEffect(() => {
    // Simulate loading security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'profile',
        severity: 'high',
        title: 'Suspicious Profile Activity',
        description: 'User created multiple projects with identical descriptions',
        userId: 'user_123',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        type: 'project',
        severity: 'critical',
        title: 'Potential Fraudulent Project',
        description: 'Project contains AI-generated images and unrealistic funding goal',
        projectId: 'proj_456',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'reviewing'
      },
      {
        id: '3',
        type: 'behavior',
        severity: 'medium',
        title: 'Rapid Account Creation',
        description: 'Multiple accounts created from same IP address',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleAlertAction = (alertId: string, action: 'resolve' | 'dismiss' | 'escalate') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'resolve' ? 'resolved' : 'dismissed' }
        : alert
    ));
    setSelectedAlert(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'alerts', label: 'Security Alerts', icon: ExclamationTriangleIcon },
    { id: 'users', label: 'User Security', icon: UserIcon },
    { id: 'projects', label: 'Project Security', icon: FlagIcon },
  ];

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Security Dashboard</h2>
              <p className="text-secondary-400">Monitor and manage platform security</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-secondary-300">System Secure</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary-400">Last Updated</div>
              <div className="text-sm font-medium">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-secondary-700/50">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-secondary-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
                { label: 'Verified Users', value: stats.verifiedUsers, color: 'green' },
                { label: 'Suspicious Profiles', value: stats.suspiciousProfiles, color: 'yellow' },
                { label: 'Active Threats', value: stats.activeThreats, color: 'red' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50"
                >
                  <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                  <div className="text-sm text-secondary-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Alerts */}
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Security Alerts</h3>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-secondary-600/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{alert.title}</div>
                        <div className="text-sm text-secondary-400">{alert.description}</div>
                      </div>
                    </div>
                    <div className="text-xs text-secondary-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Security Alerts</h3>
              <div className="flex items-center space-x-2">
                <select className="bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Severity</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select className="bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Reviewing</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50 hover:border-secondary-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.type === 'profile' && <UserIcon className="w-4 h-4 text-secondary-400" />}
                        {alert.type === 'project' && <FlagIcon className="w-4 h-4 text-secondary-400" />}
                        {alert.type === 'behavior' && <ExclamationTriangleIcon className="w-4 h-4 text-secondary-400" />}
                        <span className="text-sm text-secondary-400 capitalize">{alert.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-secondary-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        alert.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {alert.status}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-medium text-white">{alert.title}</div>
                    <div className="text-sm text-secondary-400 mt-1">{alert.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">User Security Analysis</h3>
            
            {/* User Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-sm text-secondary-400">Verification Rate</div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
                </div>
              </div>
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-sm text-secondary-400">Risk Score Avg</div>
                <div className="text-2xl font-bold text-yellow-400">24</div>
              </div>
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-sm text-secondary-400">Blocked Users</div>
                <div className="text-2xl font-bold text-red-400">{stats.blockedUsers}</div>
              </div>
            </div>

            {/* Recent User Activity */}
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h4 className="font-medium text-white mb-4">High-Risk Users</h4>
              <div className="space-y-3">
                {[
                  { name: 'John Doe', email: 'john@tempmail.com', riskScore: 85, reason: 'Temporary email, rapid project creation' },
                  { name: 'Test User', email: 'test123@example.com', riskScore: 72, reason: 'Suspicious name pattern, incomplete profile' },
                  { name: 'Sarah Johnson', email: 'sarah.j@email.com', riskScore: 68, reason: 'Multiple duplicate projects' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-600/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-secondary-400">{user.email}</div>
                      <div className="text-xs text-orange-400 mt-1">{user.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        user.riskScore > 80 ? 'text-red-400' :
                        user.riskScore > 60 ? 'text-orange-400' : 'text-yellow-400'
                      }`}>
                        {user.riskScore}
                      </div>
                      <div className="text-xs text-secondary-400">Risk Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Project Security Analysis</h3>
            
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h4 className="font-medium text-white mb-4">Flagged Projects</h4>
              <div className="space-y-3">
                {[
                  { title: 'Revolutionary AI Startup', creator: 'TechVision', flags: ['Unrealistic timeline', 'AI-generated images'], severity: 'high' },
                  { title: 'Crypto Mining Farm', creator: 'CryptoKing', flags: ['Suspicious funding goal', 'No external links'], severity: 'medium' },
                  { title: 'Mobile App Development', creator: 'AppDev Pro', flags: ['Duplicate content', 'Incomplete team info'], severity: 'low' }
                ].map((project, index) => (
                  <div key={index} className="p-4 bg-secondary-600/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">{project.title}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(project.severity as any)}`}>
                        {project.severity.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm text-secondary-400 mb-2">by {project.creator}</div>
                    <div className="flex flex-wrap gap-2">
                      {project.flags.map((flag, flagIndex) => (
                        <span key={flagIndex} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary-800 rounded-xl border border-secondary-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-secondary-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded text-sm font-medium border ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity.toUpperCase()}
                </div>
                <div className="text-sm text-secondary-400">
                  {new Date(selectedAlert.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">{selectedAlert.title}</h4>
                <p className="text-secondary-300">{selectedAlert.description}</p>
              </div>

              {selectedAlert.userId && (
                <div className="bg-secondary-700/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-white mb-1">User ID</div>
                  <div className="text-sm text-secondary-400">{selectedAlert.userId}</div>
                </div>
              )}

              {selectedAlert.projectId && (
                <div className="bg-secondary-700/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-white mb-1">Project ID</div>
                  <div className="text-sm text-secondary-400">{selectedAlert.projectId}</div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Resolve</span>
                </button>
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, 'dismiss')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Dismiss</span>
                </button>
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, 'escalate')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Escalate</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;