import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  CalendarDaysIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface GanttTask extends Task {
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  dependencies?: string[];
}

interface GanttChartProps {
  projectId?: string;
  tasks?: GanttTask[];
  onTaskChange?: (task: GanttTask) => void;
  onTaskDelete?: (task: GanttTask) => void;
  allowEdit?: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({
  projectId,
  tasks: externalTasks,
  onTaskChange,
  onTaskDelete,
  allowEdit = true
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, setIsChecked] = useState(true);
  const [tasks, setTasks] = useState<GanttTask[]>([]);

  // Initialize with mock data if no external tasks provided
  React.useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks);
    } else {
      const mockTasks: GanttTask[] = [
        {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 15),
          name: 'Project Planning',
          id: 'task-0',
          type: 'project',
          progress: 100,
          isDisabled: false,
          priority: 'high',
          status: 'completed',
          assignee: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Initial project setup and planning phase'
        },
        {
          start: new Date(2024, 0, 16),
          end: new Date(2024, 1, 28),
          name: 'Design Phase',
          id: 'task-1',
          type: 'project',
          progress: 75,
          isDisabled: false,
          priority: 'high',
          status: 'in-progress',
          assignee: {
            id: 'user-2',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
          },
          description: 'UI/UX design and wireframing'
        },
        {
          start: new Date(2024, 0, 18),
          end: new Date(2024, 1, 5),
          name: 'User Research',
          id: 'task-2',
          type: 'task',
          progress: 100,
          isDisabled: false,
          project: 'task-1',
          priority: 'medium',
          status: 'completed',
          assignee: {
            id: 'user-3',
            name: 'Emily Watson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Conduct user interviews and surveys'
        },
        {
          start: new Date(2024, 1, 6),
          end: new Date(2024, 1, 20),
          name: 'Wireframing',
          id: 'task-3',
          type: 'task',
          progress: 80,
          isDisabled: false,
          project: 'task-1',
          priority: 'high',
          status: 'in-progress',
          assignee: {
            id: 'user-2',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Create low-fidelity wireframes',
          dependencies: ['task-2']
        },
        {
          start: new Date(2024, 1, 21),
          end: new Date(2024, 1, 28),
          name: 'UI Design',
          id: 'task-4',
          type: 'task',
          progress: 30,
          isDisabled: false,
          project: 'task-1',
          priority: 'high',
          status: 'in-progress',
          assignee: {
            id: 'user-4',
            name: 'David Park',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
          },
          description: 'High-fidelity UI design',
          dependencies: ['task-3']
        },
        {
          start: new Date(2024, 2, 1),
          end: new Date(2024, 3, 30),
          name: 'Development Phase',
          id: 'task-5',
          type: 'project',
          progress: 25,
          isDisabled: false,
          priority: 'urgent',
          status: 'not-started',
          assignee: {
            id: 'user-5',
            name: 'Mike Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Frontend and backend development'
        },
        {
          start: new Date(2024, 2, 1),
          end: new Date(2024, 2, 21),
          name: 'Backend API',
          id: 'task-6',
          type: 'task',
          progress: 0,
          isDisabled: false,
          project: 'task-5',
          priority: 'urgent',
          status: 'not-started',
          assignee: {
            id: 'user-5',
            name: 'Mike Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Build REST API endpoints'
        },
        {
          start: new Date(2024, 3, 1),
          end: new Date(2024, 3, 15),
          name: 'Testing & QA',
          id: 'task-7',
          type: 'task',
          progress: 0,
          isDisabled: false,
          priority: 'medium',
          status: 'not-started',
          assignee: {
            id: 'user-6',
            name: 'Lisa Zhang',
            avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Comprehensive testing and quality assurance'
        },
        {
          start: new Date(2024, 3, 16),
          end: new Date(2024, 3, 30),
          name: 'Deployment',
          id: 'task-8',
          type: 'milestone',
          progress: 0,
          isDisabled: false,
          priority: 'high',
          status: 'not-started',
          assignee: {
            id: 'user-7',
            name: 'Tom Wilson',
            avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=40&h=40&fit=crop&crop=face'
          },
          description: 'Production deployment and launch'
        }
      ];
      setTasks(mockTasks);
    }
  }, [externalTasks]);

  const viewModes = [
    { mode: ViewMode.Hour, label: 'Hour' },
    { mode: ViewMode.QuarterDay, label: 'Quarter Day' },
    { mode: ViewMode.HalfDay, label: 'Half Day' },
    { mode: ViewMode.Day, label: 'Day' },
    { mode: ViewMode.Week, label: 'Week' },
    { mode: ViewMode.Month, label: 'Month' },
    { mode: ViewMode.Year, label: 'Year' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'on-hold': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  // Gantt styling options
  const ganttStyle: StylingOption = {
    headerHeight: 50,
    columnWidth: 65,
    listCellWidth: '155px',
    rowHeight: 50,
    ganttHeight: 600,
    barBackgroundColor: '#3b82f6',
    barBackgroundSelectedColor: '#1d4ed8',
    barProgressColor: '#60a5fa',
    barProgressSelectedColor: '#93c5fd',
    projectBackgroundColor: '#7c3aed',
    projectBackgroundSelectedColor: '#5b21b6',
    projectProgressColor: '#a78bfa',
    projectProgressSelectedColor: '#c4b5fd',
    milestoneBackgroundColor: '#059669',
    milestoneBackgroundSelectedColor: '#047857',
    handleWidth: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '14px',
    todayColor: 'rgba(252, 165, 165, 0.5)'
  };

  const ganttDisplayOptions: DisplayOption = {
    viewMode: viewMode,
    preStepsCount: 1,
    locale: 'en-US'
  };

  const handleTaskChange = (task: Task) => {
    const updatedTask = task as GanttTask;
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    onTaskChange?.(updatedTask);
    toast.success('Task updated successfully');
  };

  const handleTaskDelete = (task: Task) => {
    const taskToDelete = task as GanttTask;
    setTasks(prev => prev.filter(t => t.id !== task.id));
    onTaskDelete?.(taskToDelete);
    toast.success('Task deleted successfully');
  };

  const handleProgressChange = (task: Task) => {
    const updatedTask = task as GanttTask;
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    onTaskChange?.(updatedTask);
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
    ));
  };

  const TaskListHeader: React.FC = () => (
    <div className="flex items-center bg-secondary-800 text-white px-4 py-3 border-b border-secondary-700">
      <div className="flex-1 font-medium">Task Name</div>
      <div className="w-20 text-center font-medium">Progress</div>
      <div className="w-24 text-center font-medium">Assignee</div>
    </div>
  );

  const TaskListTable: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
    <div className="bg-secondary-900">
      {tasks.map((task) => {
        const ganttTask = task as GanttTask;
        return (
          <div
            key={task.id}
            className="flex items-center px-4 py-3 border-b border-secondary-700 hover:bg-secondary-800/50"
            style={{ height: ganttStyle.rowHeight }}
          >
            <div className="flex-1 flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getPriorityColor(ganttTask.priority) }}
              />
              <div>
                <div className="font-medium text-white">{task.name}</div>
                <div className="text-sm text-secondary-400">{ganttTask.description}</div>
              </div>
            </div>
            <div className="w-20 text-center">
              <div className="text-sm font-medium text-white">{task.progress}%</div>
              <div className="w-full bg-secondary-700 rounded-full h-2 mt-1">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
            <div className="w-24 flex justify-center">
              {ganttTask.assignee && (
                <img
                  src={ganttTask.assignee.avatar}
                  alt={ganttTask.assignee.name}
                  className="w-8 h-8 rounded-full object-cover border border-secondary-600"
                  title={ganttTask.assignee.name}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const projectStats = useMemo(() => {
    const totalTasks = tasks.filter(t => t.type === 'task').length;
    const completedTasks = tasks.filter(t => t.type === 'task' && t.progress === 100).length;
    const inProgressTasks = tasks.filter(t => t.type === 'task' && t.progress > 0 && t.progress < 100).length;
    const overdueTasks = tasks.filter(t => {
      const today = new Date();
      return t.end < today && t.progress < 100;
    }).length;

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks };
  }, [tasks]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white">Gantt Chart</h2>
          <p className="text-secondary-400">Timeline visualization and project scheduling</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {viewModes.map(({ mode, label }) => (
              <option key={mode} value={mode}>{label}</option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 p-6 border-b border-secondary-700/50">
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{projectStats.totalTasks}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{projectStats.completedTasks}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{projectStats.inProgressTasks}</p>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <EyeIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{projectStats.overdueTasks}</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-secondary-900">
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            locale="en-US"
            columnWidth={ganttStyle.columnWidth}
            listCellWidth={ganttStyle.listCellWidth}
            rowHeight={ganttStyle.rowHeight}
            ganttHeight={ganttStyle.ganttHeight}
            barBackgroundColor={ganttStyle.barBackgroundColor}
            barBackgroundSelectedColor={ganttStyle.barBackgroundSelectedColor}
            barProgressColor={ganttStyle.barProgressColor}
            barProgressSelectedColor={ganttStyle.barProgressSelectedColor}
            projectBackgroundColor={ganttStyle.projectBackgroundColor}
            projectBackgroundSelectedColor={ganttStyle.projectBackgroundSelectedColor}
            projectProgressColor={ganttStyle.projectProgressColor}
            projectProgressSelectedColor={ganttStyle.projectProgressSelectedColor}
            milestoneBackgroundColor={ganttStyle.milestoneBackgroundColor}
            milestoneBackgroundSelectedColor={ganttStyle.milestoneBackgroundSelectedColor}
            fontFamily={ganttStyle.fontFamily}
            fontSize={ganttStyle.fontSize}
            todayColor={ganttStyle.todayColor}
            TaskListHeader={TaskListHeader}
            TaskListTable={TaskListTable}
            onDateChange={allowEdit ? handleTaskChange : undefined}
            onProgressChange={allowEdit ? handleProgressChange : undefined}
            onDelete={allowEdit ? handleTaskDelete : undefined}
            onExpanderClick={handleExpanderClick}
          />
        </div>
      </div>
    </div>
  );
};

export default GanttChart;