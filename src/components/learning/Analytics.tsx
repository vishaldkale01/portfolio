import { PlanStats } from '../../utils/learningApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  stats: PlanStats;
}

export default function Analytics({ stats }: AnalyticsProps) {
  const chartData = stats.taskBreakdown.map((task) => ({
    name: task.title.substring(0, 20) + (task.title.length > 20 ? '...' : ''),
    hours: parseFloat(task.totalHours),
  }));

  const completionPercentage = stats.totalTasks > 0
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📊 Analytics & Progress</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-blue-500/10 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="text-blue-400 text-xs sm:text-sm font-semibold mb-1">Total Time</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalHours}h</div>
        </div>

        <div className="bg-green-500/10 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="text-green-400 text-xs sm:text-sm font-semibold mb-1">Completed</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
        </div>

        <div className="bg-purple-500/10 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="text-purple-400 text-xs sm:text-sm font-semibold mb-1">Progress</div>
          <div className="text-2xl sm:text-3xl font-bold">{completionPercentage}%</div>
        </div>

        <div className="bg-orange-500/10 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="text-orange-400 text-xs sm:text-sm font-semibold mb-1">Total Tasks</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalTasks}</div>
        </div>
      </div>

      {/* Time Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Time Spent per Task</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Bar dataKey="hours" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
