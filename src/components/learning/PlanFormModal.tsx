import { useState, useEffect } from 'react';
import { learningApi, LearningPlan } from '../../utils/learningApi';
import { motion } from 'framer-motion';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: LearningPlan;
}

export default function PlanFormModal({ isOpen, onClose, onSuccess, plan }: PlanFormModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    goals: string;
    status: 'active' | 'completed' | 'paused' | 'archived';
    startDate: string;
    targetEndDate: string;
  }>({
    title: '',
    description: '',
    goals: '',
    status: 'active',
    startDate: '',
    targetEndDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when plan prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: plan?.title || '',
        description: plan?.description || '',
        goals: plan?.goals?.join('\n') || '',
        status: plan?.status || 'active',
        startDate: plan?.startDate?.split('T')[0] || '',
        targetEndDate: plan?.targetEndDate?.split('T')[0] || '',
      });
      setError(null);
    }
  }, [isOpen, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const planData = {
      title: formData.title,
      description: formData.description,
      goals: formData.goals.split('\n').filter(g => g.trim()),
      status: formData.status,
      startDate: formData.startDate,
      targetEndDate: formData.targetEndDate,
    };

    try {
      const response = plan
        ? await learningApi.updatePlan(plan._id, planData)
        : await learningApi.createPlan(planData);

      if ('error' in response) {
        setError(response.error);
        setLoading(false);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Plan save error:', err);
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
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {plan ? 'Edit Learning Plan' : 'Create New Learning Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., Master React & TypeScript"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Brief description of this learning plan..."
            />
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Goals (one per line)
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-sm"
              placeholder="Learn React Hooks&#10;Master TypeScript&#10;Build 5 projects"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Target End Date
              </label>
              <input
                type="date"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
