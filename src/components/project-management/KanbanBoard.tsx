import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  FlagIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Type compatibility fix for React 19
const SortableContextCompat = SortableContext as any;
const DragOverlayCompat = DragOverlay as any;

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: Date;
  labels: string[];
  commentsCount: number;
  attachmentsCount: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  limit?: number;
}

interface KanbanBoardProps {
  projectId?: string;
  allowEdit?: boolean;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const SortableTask: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getDueDateColor = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-500';
    if (diffDays <= 1) return 'text-orange-500';
    if (diffDays <= 3) return 'text-yellow-500';
    return 'text-secondary-400';
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-secondary-800 rounded-lg p-4 border border-secondary-700 cursor-pointer group hover:border-secondary-600 transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
          <span className="text-xs font-medium text-secondary-400 uppercase tracking-wider">
            {task.priority}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle task menu
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary-700 rounded transition-all"
        >
          <EllipsisVerticalIcon className="w-4 h-4 text-secondary-400" />
        </button>
      </div>

      {/* Task Title */}
      <h4 className="font-medium text-white mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-secondary-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-600 text-secondary-300">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex items-center space-x-1 mb-3 ${getDueDateColor(task.dueDate)}`}>
          <CalendarDaysIcon className="w-4 h-4" />
          <span className="text-xs font-medium">{formatDueDate(task.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Comments */}
          {task.commentsCount > 0 && (
            <div className="flex items-center space-x-1 text-secondary-400">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-xs">{task.commentsCount}</span>
            </div>
          )}
          
          {/* Attachments */}
          {task.attachmentsCount > 0 && (
            <div className="flex items-center space-x-1 text-secondary-400">
              <PaperClipIcon className="w-4 h-4" />
              <span className="text-xs">{task.attachmentsCount}</span>
            </div>
          )}

          {/* Time Estimate */}
          {task.estimatedHours && (
            <div className="flex items-center space-x-1 text-secondary-400">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <img
            src={task.assignee.avatar}
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full object-cover border border-secondary-600"
            title={task.assignee.name}
          />
        )}
      </div>
    </motion.div>
  );
};

const SortableColumn: React.FC<{
  column: Column;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}> = ({ column, onAddTask, onEditTask, onDeleteTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-80 bg-secondary-900/50 rounded-xl border border-secondary-700/50 backdrop-blur-sm"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-700/50">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-white">{column.title}</h3>
          <span className="bg-secondary-700 text-secondary-300 text-xs font-medium px-2 py-1 rounded-full">
            {column.tasks.length}
            {column.limit && `/${column.limit}`}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 hover:bg-secondary-700 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5 text-secondary-400 hover:text-white" />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
        <SortableContextCompat items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {column.tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </AnimatePresence>
        </SortableContextCompat>
        
        {column.tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-secondary-500">
            <TagIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">No tasks yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, allowEdit = true }) => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: 'bg-gray-500',
      tasks: []
    },
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-blue-500',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-yellow-500',
      limit: 3,
      tasks: []
    },
    {
      id: 'review',
      title: 'In Review',
      color: 'bg-purple-500',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-green-500',
      tasks: []
    }
  ]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Initialize with mock data
  React.useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Design user authentication flow',
        description: 'Create wireframes and mockups for the login and registration process',
        status: 'todo',
        priority: 'high',
        assignee: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
        },
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        labels: ['Design', 'UI/UX'],
        commentsCount: 3,
        attachmentsCount: 2,
        estimatedHours: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Implement JWT authentication',
        description: 'Set up JWT token-based authentication for the backend API',
        status: 'in-progress',
        priority: 'urgent',
        assignee: {
          id: 'user-2',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
        },
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Security'],
        commentsCount: 5,
        attachmentsCount: 0,
        estimatedHours: 12,
        actualHours: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        title: 'Write unit tests for user service',
        description: 'Create comprehensive unit tests for all user-related functionality',
        status: 'backlog',
        priority: 'medium',
        assignee: {
          id: 'user-3',
          name: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        labels: ['Testing', 'Backend'],
        commentsCount: 1,
        attachmentsCount: 0,
        estimatedHours: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-4',
        title: 'Deploy to staging environment',
        description: 'Set up CI/CD pipeline and deploy latest changes to staging',
        status: 'review',
        priority: 'low',
        labels: ['DevOps', 'Deployment'],
        commentsCount: 0,
        attachmentsCount: 1,
        estimatedHours: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-5',
        title: 'Update documentation',
        description: 'Update API documentation with latest endpoint changes',
        status: 'done',
        priority: 'low',
        assignee: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
        },
        labels: ['Documentation'],
        commentsCount: 2,
        attachmentsCount: 0,
        estimatedHours: 2,
        actualHours: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: mockTasks.filter(task => task.status === column.id)
    })));
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task and its current column
    let activeTask: Task | undefined;
    let activeColumnId: string | undefined;
    
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === activeId);
      if (task) {
        activeTask = task;
        activeColumnId = column.id;
        break;
      }
    }

    if (!activeTask || !activeColumnId) return;

    // Determine if we're moving to a different column or reordering within the same column
    const isOverColumn = columns.some(col => col.id === overId);
    const targetColumnId = isOverColumn ? overId : columns.find(col => 
      col.tasks.some(t => t.id === overId)
    )?.id;

    if (!targetColumnId) return;

    setColumns(prev => {
      const newColumns = [...prev];
      
      // Remove task from current column
      const activeColumnIndex = newColumns.findIndex(col => col.id === activeColumnId);
      const activeColumn = { ...newColumns[activeColumnIndex] };
      activeColumn.tasks = activeColumn.tasks.filter(t => t.id !== activeId);
      newColumns[activeColumnIndex] = activeColumn;

      // Add task to target column
      const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
      const targetColumn = { ...newColumns[targetColumnIndex] };
      
      if (isOverColumn) {
        // Dropped on column header - add to end
        targetColumn.tasks = [...targetColumn.tasks, { ...activeTask!, status: targetColumnId }];
      } else {
        // Dropped on specific task - insert at that position
        const overTaskIndex = targetColumn.tasks.findIndex(t => t.id === overId);
        const updatedTasks = [...targetColumn.tasks];
        updatedTasks.splice(overTaskIndex, 0, { ...activeTask!, status: targetColumnId });
        targetColumn.tasks = updatedTasks;
      }
      
      newColumns[targetColumnIndex] = targetColumn;
      
      return newColumns;
    });

    toast.success(`Task moved to ${columns.find(col => col.id === targetColumnId)?.title}`);
  };

  const handleAddTask = (columnId: string) => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== taskId)
    })));
    toast.success('Task deleted');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Board</h2>
          <p className="text-secondary-400">Manage your project tasks with visual boards</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAddTask('todo')}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Task</span>
        </motion.button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 min-w-max">
            <SortableContextCompat items={columns.map(col => col.id)}>
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </SortableContextCompat>
          </div>

          <DragOverlayCompat>
            {activeTask ? (
              <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700 shadow-lg opacity-90">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${priorityColors[activeTask.priority]}`} />
                  <span className="text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    {activeTask.priority}
                  </span>
                </div>
                <h4 className="font-medium text-white">{activeTask.title}</h4>
              </div>
            ) : null}
          </DragOverlayCompat>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;