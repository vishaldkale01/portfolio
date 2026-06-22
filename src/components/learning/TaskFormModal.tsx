import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { learningApi, LearningTask, Phase } from '../../utils/learningApi';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planId: string;
  phaseId?: string;
  task?: LearningTask;
  phases?: Phase[];
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, planId, phaseId, task, phases = [] }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    priority: task?.priority || 'medium',
    title: task?.title || '',
    description: task?.description || '',
    aim: task?.aim || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    status: task?.status || 'pending',
    planId,
    phaseId: phaseId || task?.phaseId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      priority: task?.priority || 'medium',
      title: task?.title || '',
      description: task?.description || '',
      aim: task?.aim || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      status: task?.status || 'pending',
      planId,
      phaseId: phaseId || task?.phaseId || '',
    });
  }, [isOpen, task, phaseId, planId]);

  const handleSubmit = async (e: React.FormEvent | null, close = true) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    const taskData = {
      ...formData,
      dueDate: formData.dueDate || undefined,
      phaseId: formData.phaseId || undefined,
    };

    try {
      const response = task ? await learningApi.updateTask(task._id, taskData) : await learningApi.createTask(taskData);

      if ('error' in response) {
        setError(response.error);
        setLoading(false);
      } else {
        onSuccess();
        if (close) {
          onClose();
        } else {
          setFormData({
            priority: 'medium',
            title: '',
            description: '',
            aim: '',
            dueDate: '',
            status: 'pending',
            planId,
            phaseId: formData.phaseId,
          });
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Task save error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Learn useState and useEffect"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="What needs to be done..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Aim/Purpose</label>
                <input
                  type="text"
                  value={formData.aim}
                  onChange={(e) => setFormData({ ...formData, aim: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="What is the goal of this task?"
                />
              </div>
            </div>

            <aside className="space-y-4 lg:pl-2">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Settings</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phase</label>
                  <select
                    value={formData.phaseId}
                    onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Unassigned</option>
                    {phases.map((phase) => (
                      <option key={phase._id} value={phase._id}>
                        {phase.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md">
              Cancel
            </button>
            {!task && (
              <button
                type="button"
                onClick={() => handleSubmit(null, false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                Save & Add Another
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
