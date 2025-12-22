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
      // Expand all phases by default when loading a plan
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
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20',
      paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'not-started': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📚 Learning Management
        </h2>
        <button
          onClick={() => {
            setEditingPlan(undefined);
            setPlanModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
        >
          + New Learning Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4 text-white">All Plans</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="text-gray-500 text-sm">No plans yet. Create one!</div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedPlan?.plan._id === plan._id
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  onClick={() => handlePlanSelect(plan._id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-white line-clamp-1">{plan.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(plan.status)}`}>
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
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 sm:p-5">
          {!selectedPlan ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a plan to manage
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Header */}
              <div className="flex flex-col gap-4 border-b border-gray-700/50 pb-6">
                <div className="mt-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white tracking-tight capitalize">{selectedPlan.plan.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedPlan.plan.status)}`}>
                        {selectedPlan.plan.status}
                      </span>
                    </div>
                    {selectedPlan.plan.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">{selectedPlan.plan.description}</p>
                    )}
                  </div>

                  {/* Plan Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPlan(selectedPlan.plan);
                        setPlanModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Edit Plan"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(selectedPlan.plan._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Plan"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Phases Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-lg font-semibold text-white/90">Curriculum Phases</h4>
                  <button
                    onClick={() => {
                      setEditingPhase(undefined);
                      setSelectedPhaseId(undefined);
                      setPhaseModalOpen(true);
                    }}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-semibold transition-all"
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
                        <div key={phase._id} className="bg-gray-800/40 rounded-xl overflow-hidden shadow-sm border border-gray-700/30 group">
                          {/* Phase Header Content */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                            onClick={() => togglePhase(phase._id)}
                          >
                            {/* Phase Title Row */}
                            <div className="flex items-center justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1 rounded-md transition-all duration-200 ${isExpanded ? 'bg-gray-700 text-white rotate-90' : 'text-gray-500 hover:text-white'}`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-mono font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">#{phase.order}</span>
                                  <h5 className="font-bold text-white text-base truncate capitalize">{phase.title}</h5>
                                </div>
                              </div>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(phase.status)}`}>
                                {phase.status}
                              </span>
                            </div>

                            {/* Phase Description */}
                            <div className="pl-9 pr-2">
                              {phase.description && (
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{phase.description}</p>
                              )}

                              {/* Progress Bar */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                  {completedTasks} / {phaseTasks.length} Tasks
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Phase Bottom Actions Bar */}
                          <div className="px-4 py-2 border-t border-gray-800/50 bg-gray-900/20 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhaseId(phase._id);
                                setEditingTask(undefined);
                                setTaskModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Task
                            </button>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingPhase(phase);
                                  setPhaseModalOpen(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all"
                                title="Edit Phase"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePhase(phase._id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                                title="Delete Phase"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Tasks in Phase */}
                          {isExpanded && (
                            <div className="bg-gray-900/30 border-t border-gray-700/30 p-2 sm:p-4 space-y-3">
                              {phaseTasks.length > 0 ? (
                                phaseTasks.map((task) => (
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
                                ))
                              ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-lg">
                                  <p className="text-gray-500 text-lg mb-2">No tasks added to this phase yet.</p>
                                  <button
                                    onClick={() => {
                                      setSelectedPhaseId(phase._id);
                                      setTaskModalOpen(true);
                                    }}
                                    className="text-blue-400 text-xs hover:underline"
                                  >
                                    + Add your first task
                                  </button>
                                </div>
                              )}
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
