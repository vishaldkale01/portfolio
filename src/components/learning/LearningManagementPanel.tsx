import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { learningApi, LearningPlan, type PlanDetail as PlanDetailType, Phase, LearningTask } from '../../utils/learningApi';
import PlanFormModal from './PlanFormModal';
import PhaseFormModal from './PhaseFormModal';
import TaskFormModal from './TaskFormModal';
import TaskItem from './TaskItem';

export default function LearningManagementPanel() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailType | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LearningPlan | undefined>();
  const [editingPhase, setEditingPhase] = useState<Phase | undefined>();
  const [editingTask, setEditingTask] = useState<LearningTask | undefined>();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const fetchPlans = async () => {
    setLoading(true);
    const response = await learningApi.getAllPlans();
    if ('data' in response && response.data) {
      setPlans(response.data);
    }
    setLoading(false);
  };

  const fetchPlanDetail = async (planId: string) => {
    const response = await learningApi.getPlanById(planId);
    if ('data' in response && response.data) {
      setSelectedPlan(response.data);
      setExpandedPhases(new Set(response.data.phases.map(p => p._id)));
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePlanSelect = (planId: string) => {
    fetchPlanDetail(planId);
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Delete this learning plan and all its content?')) return;
    await learningApi.deletePlan(planId);
    fetchPlans();
    if (selectedPlan?.plan._id === planId) {
      setSelectedPlan(null);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Delete this phase?')) return;
    await learningApi.deletePhase(phaseId);
    if (selectedPlan) {
      fetchPlanDetail(selectedPlan.plan._id);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await learningApi.deleteTask(taskId);
    if (selectedPlan) {
      fetchPlanDetail(selectedPlan.plan._id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-500/20 text-green-400',
      completed: 'bg-blue-500/20 text-blue-400',
      paused: 'bg-yellow-500/20 text-yellow-400',
      archived: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-purple-500/20 text-purple-400',
      'not-started': 'bg-gray-500/20 text-gray-400',
      pending: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📚 Learning Management
        </h2>
        <button
          onClick={() => {
            setEditingPlan(undefined);
            setPlanModalOpen(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
        >
          + New Learning Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Plans List */}
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 sm:p-4 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">All Plans</h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="text-gray-500 text-sm">No plans yet. Create one!</div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all shadow-sm ${
                    selectedPlan?.plan._id === plan._id
                      ? 'bg-blue-500/20 shadow-blue-500/50'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                  onClick={() => handlePlanSelect(plan._id)}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-semibold text-sm text-white line-clamp-1">{plan.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                  {plan.goals && plan.goals.length > 0 && (
                    <p className="text-xs text-gray-400">{plan.goals.length} goals</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Detail & Management */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg">
          {!selectedPlan ? (
            <div className="h-full min-h-[200px] flex items-center justify-center text-gray-500 text-sm sm:text-base">
              Select a plan to manage
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{selectedPlan.plan.title}</h3>
                  {selectedPlan.plan.description && (
                    <p className="text-gray-400 text-sm">{selectedPlan.plan.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPlan(selectedPlan.plan);
                      setPlanModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(selectedPlan.plan._id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Phases Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                  <h4 className="text-base sm:text-lg font-semibold text-white">Phases</h4>
                  <button
                    onClick={() => {
                      setEditingPhase(undefined);
                      setSelectedPhaseId(undefined);
                      setPhaseModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold transition-all"
                  >
                    <span>+ Add Phase</span>
                  </button>
                </div>

                {selectedPlan.phases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-700/50 rounded-xl bg-gray-800/30">
                    <p className="text-gray-500 text-sm">No phases defined for this plan.</p>
                    <button
                      onClick={() => setPhaseModalOpen(true)}
                      className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      Create your first phase
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPlan.phases.sort((a, b) => a.order - b.order).map((phase) => {
                      const phaseTasks = selectedPlan.tasks.filter(t => t.phaseId === phase._id);
                      const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
                      const isExpanded = expandedPhases.has(phase._id);
                      const progress = phaseTasks.length > 0 ? Math.round((completedTasks / phaseTasks.length) * 100) : 0;

                      return (
                        <div key={phase._id} className="bg-gray-700/30 rounded-lg overflow-hidden shadow-md">
                          {/* Phase Header */}
                          <div 
                            className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between gap-3 cursor-pointer hover:bg-gray-700/70 transition-colors"
                            onClick={() => togglePhase(phase._id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <span className="text-gray-400 transform transition-transform duration-200">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                                <span className="text-gray-500 font-mono text-xs sm:text-sm">#{phase.order}</span>
                                <h5 className="font-semibold text-white text-sm sm:text-base">{phase.title}</h5>
                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(phase.status)}`}>
                                  {phase.status}
                                </span>
                              </div>
                              
                              <div className="ml-0 sm:ml-8 mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                {phase.description && (
                                  <p className="text-gray-400 text-xs">{phase.description}</p>
                                )}
                                <span className="text-xs text-blue-400 font-medium">
                                  {completedTasks}/{phaseTasks.length} Tasks Completed
                                </span>
                              </div>
                            </div>
                          </div>

                            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingPhase(phase);
                                  setPhaseModalOpen(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePhase(phase._id)}
                                className="text-red-400 hover:text-red-300 text-xs sm:text-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPhaseId(phase._id);
                                  setEditingTask(undefined);
                                  setTaskModalOpen(true);
                                }}
                                className="text-green-400 hover:text-green-300 text-xs sm:text-sm"
                              >
                                + Task
                              </button>
                            </div>
                          </div>

                          {/* Tasks in Phase */}
                          {isExpanded && phaseTasks.length > 0 && (
                            <div className="bg-gray-800/50 p-4 space-y-2">
                              {phaseTasks.map((task) => (
                                <TaskItem
                                  key={task._id}
                                  task={task}
                                  isAdmin={true}
                                  onEdit={(task) => {
                                    setEditingTask(task);
                                    setSelectedPhaseId(phase._id);
                                    setTaskModalOpen(true);
                                  }}
                                  onDelete={handleDeleteTask}
                                  onStatusChange={() => fetchPlanDetail(selectedPlan.plan._id)}
                                />
                              ))}
                            </div>
                          )}
                          
                          {isExpanded && phaseTasks.length === 0 && (
                            <div className="bg-gray-800/30 p-4 text-center text-gray-500 text-sm">
                              No tasks in this phase yet. Click "+ Task" to add one.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unassigned Tasks */}
              {selectedPlan.tasks.filter(t => !t.phaseId).length > 0 && (
                <div className="pt-6 border-t border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 px-1">Unassigned Tasks</h4>
                  <div className="space-y-3">
                    {selectedPlan.tasks.filter(t => !t.phaseId).map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        isAdmin={true}
                        onEdit={(task) => {
                          setEditingTask(task);
                          setSelectedPhaseId(undefined);
                          setTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onStatusChange={() => fetchPlanDetail(selectedPlan.plan._id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

          )}
        </div>
      </div>

      {/* Modals */}
      <PlanFormModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSuccess={() => {
          fetchPlans();
          if (selectedPlan) {
            fetchPlanDetail(selectedPlan.plan._id);
          }
        }}
        plan={editingPlan}
      />

      {selectedPlan && (
        <>
          <PhaseFormModal
            isOpen={phaseModalOpen}
            onClose={() => setPhaseModalOpen(false)}
            onSuccess={(addTasksImmediately, phaseId) => {
              fetchPlanDetail(selectedPlan.plan._id);
              if (addTasksImmediately && phaseId) {
                setSelectedPhaseId(phaseId);
                setEditingTask(undefined);
                setTaskModalOpen(true);
              }
            }}
            planId={selectedPlan.plan._id}
            phase={editingPhase}
            maxOrder={selectedPlan.phases.length}
          />

          <TaskFormModal
            isOpen={taskModalOpen}
            onClose={() => {
              setTaskModalOpen(false);
              setEditingTask(undefined);
            }}
            onSuccess={() => fetchPlanDetail(selectedPlan.plan._id)}
            planId={selectedPlan.plan._id}
            phaseId={selectedPhaseId}
            task={editingTask}
            phases={selectedPlan.phases}
          />
        </>
      )}
    </div>
  );
}
