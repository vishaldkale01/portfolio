import { Phase, LearningTask } from '../../utils/learningApi';
import TaskItem from './TaskItem';
import { motion } from 'framer-motion';

interface PhaseSectionProps {
  phase: Phase;
  tasks: LearningTask[];
  isAdmin: boolean;
}

export default function PhaseSection({ phase, tasks, isAdmin }: PhaseSectionProps) {
  const getPhaseStatusGradient = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500/10 to-transparent';
      case 'in-progress': return 'from-blue-500/10 to-transparent';
      case 'not-started': return 'from-gray-500/10 to-transparent';
      default: return 'from-gray-500/10 to-transparent';
    }
  };

  const getPhaseShadow = (status: string) => {
    switch (status) {
      case 'completed': return 'shadow-lg shadow-green-500/10';
      case 'in-progress': return 'shadow-lg shadow-blue-500/10';
      case 'not-started': return 'shadow-lg shadow-gray-500/10';
      default: return 'shadow-lg shadow-gray-500/10';
    }
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 sm:p-6 ${getPhaseShadow(phase.status)} overflow-hidden`}
    >
      {/* Colored gradient accent (replaces left border) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPhaseStatusGradient(phase.status)}`} />
      
      {/* Phase Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h3 className="text-xl sm:text-2xl font-bold break-words">
            <span className="text-gray-500 mr-2">#{phase.order}</span>
            {phase.title}
          </h3>
          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
            {completed}/{total} tasks completed
          </span>
        </div>

        {phase.description && (
          <p className="text-gray-400 text-sm mb-4 text-justify leading-relaxed">{phase.description}</p>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task._id} task={task} isAdmin={isAdmin} />
        ))}
      </div>
    </motion.div>
  );
}
