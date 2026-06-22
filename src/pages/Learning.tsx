import { useState, useEffect } from 'react';
import { learningApi, LearningPlan } from '../utils/learningApi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Learning() {
  const { theme } = useTheme();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('adminToken'));

    const fetchPlans = async () => {
      setLoading(true);
      const response = await learningApi.getAllPlans();
      if (response.error) setError(response.error);
      else if (response.data) setPlans(response.data);
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const getStatusClass = (status: LearningPlan['status']) => {
    if (status === 'active') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (status === 'completed') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    if (status === 'paused') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529]' : 'bg-gray-100'}`}>
        <div className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading learning plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529]' : 'bg-gray-100'}`}>
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 ${theme === 'dark' ? 'bg-[#0f1529] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Learning & Productivity
          </h1>
          <p className={`text-lg mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Track my learning journey, roadmaps, and productivity metrics</p>
        </motion.div>

        {isAdmin && (
          <div className="mb-7">
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold border border-blue-400/20"
            >
              + Create New Learning Plan
            </button>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">No learning plans yet. Stay tuned!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.button
                key={plan._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => navigate(`/learning/${plan._id}`)}
                className={`text-left border rounded-xl overflow-hidden transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-800 bg-[#1a2438] hover:bg-[#1d2940]'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs uppercase rounded-full border ${getStatusClass(plan.status)}`}>
                      {plan.status}
                    </span>
                    {plan.targetEndDate && (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Target: {new Date(plan.targetEndDate).toLocaleDateString()}</span>
                    )}
                  </div>

                  <h3 className={`text-3xl font-mono font-bold leading-tight mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{plan.title}</h3>

                  {plan.description && <p className={`text-sm leading-7 line-clamp-3 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{plan.description}</p>}

                  {plan.goals && plan.goals.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Goals</p>
                      <ul className="space-y-1.5">
                        {plan.goals.slice(0, 3).map((goal, i) => (
                          <li key={i} className={`text-sm flex items-start ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="text-blue-400 mr-2">•</span>
                            <span className="line-clamp-1">{goal}</span>
                          </li>
                        ))}
                        {plan.goals.length > 3 && <li className="text-xs text-gray-500">+{plan.goals.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={`px-6 py-4 border-t flex justify-between text-sm ${theme === 'dark' ? 'border-gray-800 bg-[#172133]' : 'border-gray-200 bg-gray-50'}`}>
                  <span className="text-gray-500">Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-300">View Details →</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
