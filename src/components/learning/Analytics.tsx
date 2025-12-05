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
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">📊 Analytics & Progress</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <div className="text-blue-400 text-sm font-semibold mb-1">Total Time</div>
          <div className="text-3xl font-bold">{stats.totalHours}h</div>
        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
          <div className="text-green-400 text-sm font-semibold mb-1">Completed</div>
          <div className="text-3xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4">
          <div className="text-purple-400 text-sm font-semibold mb-1">Progress</div>
          <div className="text-3xl font-bold">{completionPercentage}%</div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <div className="text-orange-400 text-sm font-semibold mb-1">Total Tasks</div>
          <div className="text-3xl font-bold">{stats.totalTasks}</div>
        </div>
      </div>

      {/* Time Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Time Spent per Task</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
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
