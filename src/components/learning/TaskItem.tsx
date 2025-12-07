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
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-900/50 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
    >
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          {/*Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h4 
              className="text-base sm:text-lg font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors break-words order-1"
              onClick={() => navigate(`/task/${task._id}`)}
              title="Click to view details and comments"
            >
              {task.title}
            </h4>
            {isAdmin ? (
               <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer outline-none w-fit ${getStatusColor(task.status)} order-2`}
               >
                 <option value="pending">Pending</option>
                 <option value="in-progress">In Progress</option>
                 <option value="completed">Completed</option>
               </select>
            ) : (
              <span className={`px-2 py-1 rounded text-xs font-semibold w-fit ${getStatusColor(task.status)} order-2`}>
                {task.status}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
          )}

          {/* Aim/Purpose */}
          {task.aim && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-blue-400">AIM:</span>
              <span className="text-sm text-gray-300 ml-2">{task.aim}</span>
            </div>
          )}

          {/* Time Spent */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span>⏱️ {formatTime(task.totalTimeSpent)}</span>
            <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions & Timer */}
        <div className="flex flex-col items-end gap-2">
           {/* Timer Component (Admin Only) */}
           {isAdmin && !isChecking && (
            <Timer taskId={task._id} activeTimer={activeTimer} totalTimeSpent={task.totalTimeSpent} />
          )}

          {/* Edit/Delete Actions */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit && onEdit(task)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(task._id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
