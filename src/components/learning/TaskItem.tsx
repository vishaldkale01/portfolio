import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningTask, timeApi, learningApi } from '../../utils/learningApi';
import Timer from './Timer';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: LearningTask;
  isAdmin: boolean;
  onEdit?: (task: LearningTask) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: () => void;
}

export default function TaskItem({ task, isAdmin, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const navigate = useNavigate();
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    // Check if there's an active timer for this task
    const checkTimer = async () => {
      const response = await timeApi.getActiveTimer(task._id);
      if ('data' in response && response.data) {
        setActiveTimer(response.data.activeTimer);
      }
      setIsChecking(false);
    };
    checkTimer();
  }, [task._id]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
  };

  const getDueDateState = () => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (task.status !== 'completed' && diffDays < 0) {
      return { label: 'Overdue', className: 'bg-red-500/10 text-red-300 border-red-500/30' };
    }
    if (task.status !== 'completed' && diffDays <= 2) {
      return { label: 'Due Soon', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' };
    }
    return { label: `Due ${due.toLocaleDateString()}`, className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await learningApi.updateTask(task._id, { status: newStatus as any });
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const quickSetStatus = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (task.status === newStatus || updatingStatus) return;
    await handleStatusChange(newStatus);
  };

  const handleAddNote = async () => {
    const content = window.prompt('Add a quick learning note:');
    if (!content || !content.trim()) return;

    setAddingNote(true);
    try {
      await learningApi.addTaskNote(task._id, content.trim());
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Failed to add note', error);
    } finally {
      setAddingNote(false);
    }
  };

  const dueDateState = getDueDateState();
  const noteCount = task.notes?.length || 0;
  const latestNote = noteCount > 0 ? task.notes?.[noteCount - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-gray-900/40 hover:bg-gray-800/60 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all duration-200"
    >
      {/* Top Section: Content */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Header: Title, Status, Date */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4
              className="text-base sm:text-lg font-bold text-gray-100 cursor-pointer hover:text-blue-400 transition-colors leading-snug mb-1"
              onClick={() => navigate(`/task/${task._id}`)}
              title="Click to view details"
            >
              {task.title}
            </h4>
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                {task.priority || 'medium'}
              </span>
              {dueDateState && (
                <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${dueDateState.className}`}>
                  {dueDateState.label}
                </span>
              )}
              {noteCount > 0 && (
                <span className="px-2 py-0.5 rounded border text-[10px] font-semibold bg-purple-500/10 text-purple-300 border-purple-500/30">
                  {noteCount} note{noteCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aim/Purpose */}
        {task.aim && (
          <div className="flex items-start">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium max-w-full">
              <span className="opacity-70 uppercase tracking-wider font-bold text-[10px]">AIM</span>
              <span className="w-px h-3 bg-blue-500/30"></span>
              <span className="truncate">{task.aim}</span>
            </span>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {task.description}
          </p>
        )}

        {latestNote && (
          <p className="text-xs text-purple-300/90 border-l-2 border-purple-500/30 pl-2">
            Last note: {latestNote.content}
          </p>
        )}

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => quickSetStatus('in-progress')}
              disabled={updatingStatus || task.status === 'in-progress'}
              className="px-2.5 py-1 text-[11px] rounded-md border border-blue-500/30 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-50"
            >
              Start
            </button>
            <button
              onClick={() => quickSetStatus('pending')}
              disabled={updatingStatus || task.status === 'pending'}
              className="px-2.5 py-1 text-[11px] rounded-md border border-gray-500/30 text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 disabled:opacity-50"
            >
              Pause
            </button>
            <button
              onClick={() => quickSetStatus('completed')}
              disabled={updatingStatus || task.status === 'completed'}
              className="px-2.5 py-1 text-[11px] rounded-md border border-green-500/30 text-green-300 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50"
            >
              Complete
            </button>
            <button
              onClick={handleAddNote}
              disabled={addingNote}
              className="px-2.5 py-1 text-[11px] rounded-md border border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50"
            >
              {addingNote ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: Action Bar */}
      <div className="px-3 sm:px-4 py-2 border-t border-gray-800/50 bg-gray-900/20 flex flex-wrap items-center justify-between gap-3 rounded-b-lg">
        {/* Left: Timer/Progress Info */}
        {isAdmin && !isChecking ? (
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="relative flex-shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`appearance-none pl-2 pr-4 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer bg-transparent border ${getStatusColor(task.status)} outline-none hover:bg-white/5 transition-colors`}
                >
                  <option value="pending" className="bg-gray-800 text-gray-300">Pending</option>
                  <option value="in-progress" className="bg-gray-800 text-blue-300">In Progress</option>
                  <option value="completed" className="bg-gray-800 text-green-300">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-current opacity-50">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : (
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            )}
            <Timer taskId={task._id} activeTimer={activeTimer} totalTimeSpent={task.totalTimeSpent} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-mono">{formatTime(task.totalTimeSpent)}</span>
          </div>
        )}

        {/* Right: Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit && onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all"
              title="Edit Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete && onDelete(task._id)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
              title="Delete Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
