import { Phase, LearningTask } from '../../utils/learningApi';
import TaskItem from './TaskItem';
import { motion } from 'framer-motion';

interface PhaseSectionProps {
  phase: Phase;
  tasks: LearningTask[];
  isAdmin: boolean;
}

export default function PhaseSection({ phase, tasks, isAdmin }: PhaseSectionProps) {
  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'in-progress': return 'border-blue-500 bg-blue-500/10';
      case 'not-started': return 'border-gray-500 bg-gray-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 ${getPhaseStatusColor(phase.status)} bg-gray-800/50 backdrop-blur-lg rounded-xl p-6`}
    >
      {/* Phase Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">
            <span className="text-gray-500 mr-2">#{phase.order}</span>
            {phase.title}
          </h3>
          <span className="text-sm text-gray-400">
            {completed}/{total} tasks completed
          </span>
        </div>

        {phase.description && (
          <p className="text-gray-400 text-sm mb-4 text-justify leading-relaxed">{phase.description}</p>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
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
          <TaskItem key={task._id} task={task} isAdmin={isAdmin} allTasks={tasks} />
        ))}
      </div>
    </motion.div>
  );
}
