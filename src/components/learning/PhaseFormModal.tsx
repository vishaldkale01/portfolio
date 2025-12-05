import { useState } from 'react';
import { learningApi, Phase } from '../../utils/learningApi';
import { motion } from 'framer-motion';

interface PhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addTasksImmediately?: boolean, phaseId?: string) => void;
  planId: string;
  phase?: Phase;
  maxOrder: number;
}

export default function PhaseFormModal({ isOpen, onClose, onSuccess, planId, phase, maxOrder }: PhaseFormModalProps) {
  const [formData, setFormData] = useState({
    title: phase?.title || '',
    description: phase?.description || '',
    order: phase?.order || maxOrder + 1,
    status: phase?.status || 'not-started',
    planId,
  });
  const [addTasksImmediately, setAddTasksImmediately] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = phase
      ? await learningApi.updatePhase(phase._id, formData)
      : await learningApi.createPhase(formData);

    if ('error' in response) {
      setError(response.error);
      setLoading(false);
    } else {
      const phaseId = 'data' in response ? response.data?._id : phase?._id;
      onSuccess(addTasksImmediately, phaseId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 max-w-xl w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {phase ? 'Edit Phase' : 'Add New Phase'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Week 1-2: React Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Brief description of this phase..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Order</label>
              <input
                type="number"
                required
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {!phase && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="addTasksImmediately"
                checked={addTasksImmediately}
                onChange={(e) => setAddTasksImmediately(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500/20"
              />
              <label htmlFor="addTasksImmediately" className="text-sm text-gray-300 cursor-pointer select-none">
                Add tasks after creating
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : phase ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
