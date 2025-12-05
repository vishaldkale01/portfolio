import { useState, useEffect } from 'react';
import { learningApi, LearningPlan } from '../utils/learningApi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Learning() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);

    // Fetch all plans
    const fetchPlans = async () => {
      setLoading(true);
      const response = await learningApi.getAllPlans();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setPlans(response.data);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

 const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleCreatePlan = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading learning plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Learning & Productivity
          </h1>
          <p className="text-gray-300 text-lg">
            Track my learning journey, roadmaps, and productivity metrics
          </p>
        </motion.div>

        {/* Create Plan Button (Admin Only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <button
              onClick={handleCreatePlan}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              + Create New Learning Plan
            </button>
          </motion.div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No learning plans yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => navigate(`/learning/${plan._id}`)}
                className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}>
                    {plan.status.toUpperCase()}
                  </span>
                  {plan.targetEndDate && (
                    <span className="text-xs text-gray-400">
                      Target: {new Date(plan.targetEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Plan Title */}
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                  {plan.title}
                </h3>

                {/* Description */}
                {plan.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {plan.description}
                  </p>
                )}

                {/* Goals */}
                {plan.goals && plan.goals.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Goals</h4>
                    <ul className="space-y-1">
                      {plan.goals.slice(0, 3).map((goal, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          <span className="line-clamp-1">{goal}</span>
                        </li>
                      ))}
                      {plan.goals.length > 3 && (
                        <li className="text-xs text-gray-500">+{plan.goals.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                  <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 group-hover:text-blue-300">View Details →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
