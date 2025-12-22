import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  learningApi,
  timeApi,
  type PlanDetail as PlanDetailType,
  LearningTask,
  Phase,
  PlanStats,
} from '../utils/learningApi';
import TaskItem from '../components/learning/TaskItem';
import PhaseSection from '../components/learning/PhaseSection';
import Analytics from '../components/learning/Analytics';

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [planDetail, setPlanDetail] = useState<PlanDetailType | null>(null);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);

    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      const [planResponse, statsResponse] = await Promise.all([
        learningApi.getPlanById(id),
        timeApi.getPlanStats(id),
      ]);

      if ('error' in planResponse) {
        setError(planResponse.error);
      } else if ('data' in planResponse) {
        setPlanDetail(planResponse.data);
      }

      if ('data' in statsResponse) {
        setStats(statsResponse.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const groupTasksByPhase = () => {
    if (!planDetail) return { phaseTasks: {}, noPhase: [] };

    const phaseTasks: { [phaseId: string]: { phase: Phase; tasks: LearningTask[] } } = {};
    const noPhase: LearningTask[] = [];

    planDetail.tasks.forEach((task) => {
      if (task.phaseId) {
        if (!phaseTasks[task.phaseId]) {
          const phase = planDetail.phases.find((p) => p._id === task.phaseId);
          if (phase) {
            phaseTasks[task.phaseId] = { phase, tasks: [] };
          }
        }
        phaseTasks[task.phaseId]?.tasks.push(task);
      } else {
        noPhase.push(task);
      }
    });

    return { phaseTasks, noPhase };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading plan details...</div>
      </div>
    );
  }

  if (error || !planDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error || 'Plan not found'}</div>
      </div>
    );
  }

  const { plan, phases } = planDetail;
  const { phaseTasks, noPhase } = groupTasksByPhase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <button
            onClick={() => navigate('/learning')}
            className="text-blue-400 hover:text-blue-300 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base"
          >
            ← Back to Learning Plans
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 break-words">{plan.title}</h1>
          {plan.description && (
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl">{plan.description}</p>
          )}
        </motion.div>

        {/* Analytics Section */}
        {stats && <Analytics stats={stats} />}

        {/* Phases and Tasks */}
        <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
          {phases
            .sort((a, b) => a.order - b.order)
            .map((phase) => {
              const phaseData = phaseTasks[phase._id];
              if (!phaseData) return null;

              return (
                <PhaseSection
                  key={phase._id}
                  phase={phase}
                  tasks={phaseData.tasks}
                  isAdmin={isAdmin}
                />
              );
            })}

          {/* Tasks without phase */}
          {noPhase.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Other Tasks</h3>
              <div className="space-y-3">
                {noPhase.map((task) => (
                  <TaskItem key={task._id} task={task} isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
