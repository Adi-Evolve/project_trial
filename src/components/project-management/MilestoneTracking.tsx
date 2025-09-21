import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlagIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  UserIcon,
  BellIcon,
  TrophyIcon,
  StarIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  FlagIcon as FlagSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue' | 'at-risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-100
  assignees: {
    id: string;
    name: string;
    avatar: string;
  }[];
  dependencies: string[];
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  notifications: {
    id: string;
    type: 'deadline' | 'progress' | 'dependency' | 'completion';
    message: string;
    date: Date;
    read: boolean;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MilestoneTrackingProps {
  projectId?: string;
  milestones?: Milestone[];
  onMilestoneUpdate?: (milestone: Milestone) => void;
  onMilestoneCreate?: (milestone: Omit<Milestone, 'id'>) => void;
  onMilestoneDelete?: (milestoneId: string) => void;
  allowEdit?: boolean;
}

const MilestoneTracking: React.FC<MilestoneTrackingProps> = ({
  projectId,
  milestones: externalMilestones,
  onMilestoneUpdate,
  onMilestoneCreate,
  onMilestoneDelete,
  allowEdit = true
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress' | 'created'>('dueDate');

  // Initialize with mock data if no external milestones provided
  React.useEffect(() => {
    if (externalMilestones) {
      setMilestones(externalMilestones);
    } else {
      const mockMilestones: Milestone[] = [
        {
          id: 'milestone-1',
          title: 'MVP Release',
          description: 'Launch the minimum viable product with core features',
          dueDate: new Date(2024, 2, 15),
          status: 'in-progress',
          priority: 'critical',
          progress: 75,
          assignees: [
            {
              id: 'user-1',
              name: 'Sarah Chen',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
            },
            {
              id: 'user-2',
              name: 'Alex Rodriguez',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
            }
          ],
          dependencies: [],
          tasks: [
            { id: 'task-1', title: 'Backend API Development', completed: true },
            { id: 'task-2', title: 'Frontend UI Implementation', completed: true },
            { id: 'task-3', title: 'User Authentication', completed: true },
            { id: 'task-4', title: 'Testing & Bug Fixes', completed: false },
            { id: 'task-5', title: 'Deployment Setup', completed: false }
          ],
          notifications: [
            {
              id: 'notif-1',
              type: 'deadline',
              message: 'MVP Release deadline is in 5 days',
              date: new Date(),
              read: false
            }
          ],
          tags: ['release', 'critical', 'mvp'],
          createdAt: new Date(2024, 0, 1),
          updatedAt: new Date()
        },
        {
          id: 'milestone-2',
          title: 'User Onboarding Flow',
          description: 'Complete user registration and onboarding experience',
          dueDate: new Date(2024, 1, 28),
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignees: [
            {
              id: 'user-3',
              name: 'Emily Watson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            }
          ],
          dependencies: [],
          tasks: [
            { id: 'task-6', title: 'Welcome Screen Design', completed: true },
            { id: 'task-7', title: 'Tutorial Implementation', completed: true },
            { id: 'task-8', title: 'Profile Setup Flow', completed: true }
          ],
          notifications: [
            {
              id: 'notif-2',
              type: 'completion',
              message: 'User Onboarding Flow completed successfully!',
              date: new Date(2024, 1, 28),
              read: true
            }
          ],
          tags: ['ux', 'onboarding'],
          createdAt: new Date(2024, 0, 15),
          updatedAt: new Date(2024, 1, 28)
        },
        {
          id: 'milestone-3',
          title: 'Performance Optimization',
          description: 'Improve application performance and loading times',
          dueDate: new Date(2024, 3, 10),
          status: 'not-started',
          priority: 'medium',
          progress: 0,
          assignees: [
            {
              id: 'user-4',
              name: 'David Park',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            }
          ],
          dependencies: ['milestone-1'],
          tasks: [
            { id: 'task-9', title: 'Code Splitting Implementation', completed: false },
            { id: 'task-10', title: 'Image Optimization', completed: false },
            { id: 'task-11', title: 'Caching Strategy', completed: false }
          ],
          notifications: [],
          tags: ['performance', 'optimization'],
          createdAt: new Date(2024, 1, 1),
          updatedAt: new Date(2024, 1, 1)
        },
        {
          id: 'milestone-4',
          title: 'Security Audit',
          description: 'Comprehensive security review and vulnerability fixes',
          dueDate: new Date(2024, 1, 20),
          status: 'overdue',
          priority: 'critical',
          progress: 30,
          assignees: [
            {
              id: 'user-5',
              name: 'Mike Johnson',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            }
          ],
          dependencies: [],
          tasks: [
            { id: 'task-12', title: 'Penetration Testing', completed: false },
            { id: 'task-13', title: 'SQL Injection Prevention', completed: true },
            { id: 'task-14', title: 'XSS Protection', completed: false }
          ],
          notifications: [
            {
              id: 'notif-3',
              type: 'deadline',
              message: 'Security Audit is overdue by 25 days',
              date: new Date(),
              read: false
            }
          ],
          tags: ['security', 'audit', 'critical'],
          createdAt: new Date(2024, 0, 1),
          updatedAt: new Date()
        }
      ];
      setMilestones(mockMilestones);
    }
  }, [externalMilestones]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in-progress': return 'text-blue-400 bg-blue-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/20';
      case 'at-risk': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleSolidIcon;
      case 'in-progress': return ClockIcon;
      case 'overdue': return XCircleIcon;
      case 'at-risk': return ExclamationTriangleIcon;
      default: return FlagIcon;
    }
  };

  const filteredAndSortedMilestones = useMemo(() => {
    let filtered = milestones;
    
    if (filterStatus !== 'all') {
      filtered = milestones.filter(m => m.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
  }, [milestones, filterStatus, sortBy]);

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleStatusUpdate = (milestoneId: string, newStatus: Milestone['status']) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId 
        ? { ...m, status: newStatus, updatedAt: new Date() }
        : m
    ));
    toast.success('Milestone status updated');
  };

  const unreadNotifications = milestones.reduce((acc, milestone) => 
    acc + milestone.notifications.filter(n => !n.read).length, 0
  );

  const overallProgress = milestones.length > 0 
    ? milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length 
    : 0;

  const statusCounts = milestones.reduce((acc, milestone) => {
    acc[milestone.status] = (acc[milestone.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white">Milestone Tracking</h2>
          <p className="text-secondary-400">Progress tracking with automated notifications</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline flex items-center space-x-2"
            >
              <BellIcon className="w-5 h-5" />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Milestone</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-5 gap-6 p-6 border-b border-secondary-700/50">
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Total Milestones</p>
              <p className="text-2xl font-bold text-white">{milestones.length}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FlagSolidIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{statusCounts.completed || 0}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleSolidIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{statusCounts['in-progress'] || 0}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{statusCounts.overdue || 0}</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Overall Progress</p>
              <p className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrophySolidIcon className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="at-risk">At Risk</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
        
        <div className="text-sm text-secondary-400">
          {filteredAndSortedMilestones.length} milestone{filteredAndSortedMilestones.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedMilestones.map((milestone) => {
            const StatusIcon = getStatusIcon(milestone.status);
            const isOverdue = milestone.status === 'overdue';
            const completedTasks = milestone.tasks.filter(t => t.completed).length;
            const taskProgress = milestone.tasks.length > 0 
              ? (completedTasks / milestone.tasks.length) * 100 
              : 0;

            return (
              <motion.div
                key={milestone.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleMilestoneClick(milestone)}
                className={`bg-secondary-800/50 backdrop-blur-xl rounded-xl p-6 border cursor-pointer transition-all duration-300 ${
                  isOverdue 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : 'border-secondary-700/50 hover:border-primary-500/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(milestone.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{milestone.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-1 hover:bg-secondary-700/50 rounded">
                    <EllipsisVerticalIcon className="w-5 h-5 text-secondary-400" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-secondary-300 text-sm mb-4 line-clamp-2">
                  {milestone.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-400">Progress</span>
                    <span className="text-sm font-medium text-white">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Summary */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-400">Tasks</span>
                    <span className="text-sm font-medium text-white">
                      {completedTasks} / {milestone.tasks.length}
                    </span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-secondary-400">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Due {milestone.dueDate.toLocaleDateString()}</span>
                  </div>
                  {milestone.notifications.filter(n => !n.read).length > 0 && (
                    <div className="flex items-center space-x-1">
                      <BellIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400">
                        {milestone.notifications.filter(n => !n.read).length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assignees */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {milestone.assignees.slice(0, 3).map((assignee) => (
                      <img
                        key={assignee.id}
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-8 h-8 rounded-full border-2 border-secondary-700 object-cover"
                        title={assignee.name}
                      />
                    ))}
                    {milestone.assignees.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-secondary-700 bg-secondary-600 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          +{milestone.assignees.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {milestone.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary-700/50 text-secondary-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTracking;