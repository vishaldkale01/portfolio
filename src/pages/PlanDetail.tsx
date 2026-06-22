import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DailyLearningLog, LearningTask, PlanDetail as PlanDetailType, learningApi, timeApi } from '../utils/learningApi';
import { useTheme } from '../context/ThemeContext';

const formatDuration = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const statusProgress = (status: LearningTask['status']) => {
  if (status === 'completed') return 100;
  if (status === 'in-progress') return 50;
  return 0;
};

const getTaskSummary = (task: LearningTask) =>
  task.lessonSections?.slice().sort((a, b) => a.order - b.order)[0]?.content || task.exercise?.prompt || task.description || task.aim || '';

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [detail, setDetail] = useState<PlanDetailType | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLearningLog[]>([]);
  const [stats, setStats] = useState({ todaySeconds: 0, weekSeconds: 0, totalSeconds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      const [planResponse, logsResponse, dailyResponse, weeklyResponse, planStatsResponse] = await Promise.all([
        learningApi.getPlanById(id),
        learningApi.getDailyLogs(id, 8),
        timeApi.getDailyStats(),
        timeApi.getWeeklyStats(),
        timeApi.getPlanStats(id),
      ]);

      if ('error' in planResponse) {
        setError(planResponse.error || 'Unable to load plan');
      } else if (planResponse.data) {
        setDetail(planResponse.data);
      }

      if ('data' in logsResponse && logsResponse.data) setDailyLogs(logsResponse.data);
      setStats({
        todaySeconds: 'data' in dailyResponse && dailyResponse.data ? dailyResponse.data.totalSeconds : 0,
        weekSeconds: 'data' in weeklyResponse && weeklyResponse.data ? weeklyResponse.data.totalSeconds : 0,
        totalSeconds: 'data' in planStatsResponse && planStatsResponse.data ? planStatsResponse.data.totalSeconds : 0,
      });
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const phaseRows = useMemo(() => {
    if (!detail) return [];
    return detail.phases
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((phase) => {
        const tasks = detail.tasks
          .filter((task) => task.phaseId === phase._id)
          .sort((a, b) => (a.order || 0) - (b.order || 0) || a.createdAt.localeCompare(b.createdAt));
        const completed = tasks.filter((task) => task.status === 'completed').length;
        const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
        return { phase, tasks, completed, progress };
      });
  }, [detail]);

  const orderedTasks = useMemo(() => phaseRows.flatMap((row) => row.tasks), [phaseRows]);
  const completedTasks = orderedTasks.filter((task) => task.status === 'completed').length;
  const totalProgress = orderedTasks.length ? Math.round((completedTasks / orderedTasks.length) * 100) : 0;
  const currentTask = orderedTasks.find((task) => task.status !== 'completed') || orderedTasks[0];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529] text-white' : 'bg-gray-100 text-gray-900'}`}>
        Loading roadmap...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529]' : 'bg-gray-100'}`}>
        <div className="text-red-400">Error: {error || 'Plan not found'}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 sm:px-6 ${theme === 'dark' ? 'bg-[#0f1529] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <button onClick={() => navigate('/learning')} className={theme === 'dark' ? 'text-sm text-blue-300' : 'text-sm text-blue-600'}>
          Back to learning plans
        </button>

        <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">Roadmap</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{detail.plan.title}</h1>
              {detail.plan.description && <p className={`mt-4 max-w-3xl leading-7 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{detail.plan.description}</p>}
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric label="Progress" value={`${totalProgress}%`} />
                <Metric label="Tasks" value={`${completedTasks}/${orderedTasks.length}`} />
                <Metric label="Today" value={formatDuration(stats.todaySeconds)} />
                <Metric label="This Week" value={formatDuration(stats.weekSeconds)} />
              </div>
            </div>

            <div className={`rounded-lg border p-4 ${theme === 'dark' ? 'border-blue-500/20 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Current Lesson</p>
              {currentTask ? (
                <>
                  <h2 className="mt-3 text-xl font-semibold">{currentTask.title}</h2>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{getTaskSummary(currentTask) || 'Continue your next learning task.'}</p>
                  <button onClick={() => navigate(`/task/${currentTask._id}`)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                    Open Study Page
                  </button>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-400">No tasks in this roadmap yet.</p>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            {phaseRows.map(({ phase, tasks, completed, progress }) => (
              <div key={phase._id} className={`rounded-xl border ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
                <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Phase {phase.order}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{phase.title}</h2>
                    </div>
                    <div className="text-sm text-gray-400">{completed}/{tasks.length} completed</div>
                  </div>
                  {phase.description && <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{phase.description}</p>}
                  <div className={`mt-4 h-2 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => navigate(`/task/${task._id}`)}
                      className={`grid w-full gap-3 p-4 text-left transition sm:grid-cols-[1fr_120px_90px] ${theme === 'dark' ? 'hover:bg-[#16223a]' : 'hover:bg-gray-50'}`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>{task.status}</span>
                          {typeof task.confidenceScore === 'number' && <span className="text-[11px] text-blue-400">Confidence {task.confidenceScore}/10</span>}
                        </div>
                        <h3 className="mt-2 text-base font-semibold">{task.title}</h3>
                        <p className={`mt-1 line-clamp-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{getTaskSummary(task)}</p>
                      </div>
                      <div className="text-sm text-gray-400">{formatDuration(task.totalTimeSpent)}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{statusProgress(task.status)}%</span>
                        <div className={`h-1.5 flex-1 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${statusProgress(task.status)}%` }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
              <h2 className="text-lg font-semibold">Study Totals</h2>
              <div className="mt-4 space-y-3 text-sm">
                <MetricLine label="Roadmap time" value={formatDuration(stats.totalSeconds)} />
                <MetricLine label="Today" value={formatDuration(stats.todaySeconds)} />
                <MetricLine label="This week" value={formatDuration(stats.weekSeconds)} />
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
              <h2 className="text-lg font-semibold">Recent Daily Logs</h2>
              <div className="mt-4 space-y-3">
                {dailyLogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No daily logs yet. Add one from a study page.</p>
                ) : (
                  dailyLogs.map((log) => (
                    <div key={log._id} className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-gray-800 bg-[#0d1426]' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        {typeof log.confidenceScore === 'number' && <span>{log.confidenceScore}/10</span>}
                      </div>
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{log.notes || log.practiceSummary || log.doubts || 'Learning log added.'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-700/40 bg-gray-900/20 p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
