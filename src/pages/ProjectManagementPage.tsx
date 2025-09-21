import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Squares2X2Icon,
  ChartBarIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  FlagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import KanbanBoard from '../components/project-management/KanbanBoard';
import GanttChart from '../components/project-management/GanttChart';
import MilestoneTracking from '../components/project-management/MilestoneTracking';
import AIRecommendations from '../components/ai/AIRecommendations';

type ViewMode = 'kanban' | 'gantt' | 'milestones' | 'ai-recommendations' | 'list' | 'calendar';

const ProjectManagementPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('kanban');

  const viewModes = [
    { id: 'kanban', name: 'Kanban Board', icon: Squares2X2Icon },
    { id: 'gantt', name: 'Gantt Chart', icon: ChartBarIcon },
    { id: 'milestones', name: 'Milestones', icon: FlagIcon },
    { id: 'ai-recommendations', name: 'AI Insights', icon: SparklesIcon },
    { id: 'list', name: 'Task List', icon: ListBulletIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarDaysIcon }
  ];

  const projectStats = [
    {
      label: 'Total Tasks',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: ListBulletIcon,
      color: 'bg-blue-500'
    },
    {
      label: 'In Progress',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      label: 'Completed',
      value: '12',
      change: '+5',
      changeType: 'positive',
      icon: TrophyIcon,
      color: 'bg-green-500'
    },
    {
      label: 'Team Members',
      value: '6',
      change: '+1',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'gantt':
        return <GanttChart />;
      case 'milestones':
        return <MilestoneTracking />;
      case 'ai-recommendations':
        return <AIRecommendations />;
      case 'list':
        return (
          <div className="flex items-center justify-center h-96 bg-secondary-800/30 rounded-xl border border-secondary-700/50">
            <div className="text-center">
              <ListBulletIcon className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">List View</h3>
              <p className="text-secondary-400">Detailed task list coming soon...</p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-96 bg-secondary-800/30 rounded-xl border border-secondary-700/50">
            <div className="text-center">
              <CalendarDaysIcon className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Calendar View</h3>
              <p className="text-secondary-400">Calendar visualization coming soon...</p>
            </div>
          </div>
        );
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
              <p className="text-secondary-300">AI Code Assistant Project</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline flex items-center space-x-2"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Manage Team</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline flex items-center space-x-2"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Settings</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {projectStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-secondary-800/50 backdrop-blur-xl rounded-xl p-6 border border-secondary-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm font-medium">{stat.label}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}/20`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-secondary-800/30 backdrop-blur-xl rounded-xl p-1 border border-secondary-700/50 w-fit">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveView(mode.id as ViewMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === mode.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary-800/30 backdrop-blur-xl rounded-xl border border-secondary-700/50 overflow-hidden"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectManagementPage;