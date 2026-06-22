import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CodeExerciseEditor from '../components/learning/CodeExerciseEditor';
import Timer from '../components/learning/Timer';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { LearningTask, TaskComment, commentApi, learningApi, timeApi } from '../utils/learningApi';

type ActiveTimerResponse = { activeTimer: unknown | null };

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAdmin();
  const { theme } = useTheme();
  const [task, setTask] = useState<LearningTask | null>(null);
  const [allTasks, setAllTasks] = useState<LearningTask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activeTimer, setActiveTimer] = useState<unknown | null>(null);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logDraft, setLogDraft] = useState({
    lessonSummary: '',
    practiceSummary: '',
    projectConnection: '',
    doubts: '',
    notes: '',
    confidenceScore: '6',
  });

  const currentIndex = allTasks.findIndex((item) => item._id === taskId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allTasks.length - 1;

  const fetchComments = useCallback(async (id: string) => {
    const response = await commentApi.getTaskComments(id);
    if ('data' in response && response.data) {
      const payload = response.data as unknown;
      setComments(Array.isArray(payload) ? payload : Array.isArray((payload as { data?: unknown[] })?.data) ? (payload as { data: TaskComment[] }).data : []);
    }
  }, []);

  const fetchTaskAndRelated = useCallback(async () => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const plansResponse = await learningApi.getAllPlans();
    if (!('data' in plansResponse) || !plansResponse.data) {
      setLoading(false);
      return;
    }

    let tasks: LearningTask[] = [];
    let currentTask: LearningTask | null = null;
    for (const plan of plansResponse.data) {
      const detail = await learningApi.getPlanById(plan._id);
      if ('data' in detail && detail.data) {
        const phaseOrder = new Map(detail.data.phases.map((phase) => [phase._id, phase.order]));
        const planTasks = detail.data.tasks
            .slice()
            .sort((a, b) => (phaseOrder.get(a.phaseId || '') || 999) - (phaseOrder.get(b.phaseId || '') || 999) || (a.order || 0) - (b.order || 0));
        const matchingTask = planTasks.find((item) => item._id === taskId) || null;
        if (matchingTask) {
          tasks = planTasks;
          currentTask = matchingTask;
          break;
        }
      }
    }

    setAllTasks(tasks);
    setTask(currentTask);

    if (currentTask) {
      await fetchComments(currentTask._id);
      const timerResponse = await timeApi.getActiveTimer(currentTask._id);
      if ('data' in timerResponse && timerResponse.data) {
        setActiveTimer((timerResponse.data as ActiveTimerResponse).activeTimer);
      }

      const sections = getLessonSections(currentTask);
      const exercises = getExercises(currentTask);
      setLogDraft((draft) => ({
        ...draft,
        lessonSummary: sections[0]?.content || currentTask.description || '',
        practiceSummary: exercises[0]?.prompt || 'No exercise saved yet.',
        projectConnection: sections.find((section) => section.title.toLowerCase().includes('project'))?.content || '',
        confidenceScore: String(currentTask.confidenceScore ?? 6),
      }));
    }

    setLoading(false);
  }, [fetchComments, taskId]);

  useEffect(() => {
    fetchTaskAndRelated();
  }, [fetchTaskAndRelated]);

  const lessonSections = useMemo(() => getLessonSections(task), [task]);
  const exercises = useMemo(() => getExercises(task), [task]);
  const flashcards = useMemo(() => task?.flashcards || [], [task]);

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskId || !newComment.trim() || (!isAuthenticated && !authorName.trim())) return;

    setSubmitting(true);
    if (isAuthenticated) await commentApi.addAdminComment(taskId, newComment, authorName || 'Admin');
    else await commentApi.addComment(taskId, newComment, authorName);
    setNewComment('');
    if (!isAuthenticated) setAuthorName('');
    await fetchComments(taskId);
    setSubmitting(false);
  };

  const submitDailyLog = async () => {
    if (!task) return;
    setSubmitting(true);
    await learningApi.createDailyLog(task.planId, {
      ...logDraft,
      taskId: task._id,
      date: new Date().toISOString(),
      confidenceScore: Number(logDraft.confidenceScore),
    });
    await fetchTaskAndRelated();
    setSubmitting(false);
  };

  const updateStatus = async (status: LearningTask['status']) => {
    if (!task) return;
    await learningApi.updateTask(task._id, { status });
    await fetchTaskAndRelated();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529] text-white' : 'bg-gray-100 text-gray-900'}`}>
        Loading practice page...
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1529]' : 'bg-gray-100'}`}>
        <div className="text-xl text-red-400">Task not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 sm:px-6 ${theme === 'dark' ? 'bg-[#0f1529] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className={theme === 'dark' ? 'text-sm text-blue-300' : 'text-sm text-blue-600'}>
            Back
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{currentIndex + 1} / {allTasks.length}</span>
            <button onClick={() => hasPrevious && navigate(`/task/${allTasks[currentIndex - 1]._id}`)} disabled={!hasPrevious} className="rounded border border-gray-700 px-2 py-1 disabled:opacity-40">Previous</button>
            <button onClick={() => hasNext && navigate(`/task/${allTasks[currentIndex + 1]._id}`)} disabled={!hasNext} className="rounded border border-gray-700 px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>

        <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">Practice Task</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-5xl">{task.title}</h1>
              {task.description && <div className={`mt-4 leading-7 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: task.description }} />}
            </div>
            <aside className={`rounded-lg border p-4 ${theme === 'dark' ? 'border-gray-800 bg-[#0d1426]' : 'border-gray-200 bg-gray-50'}`}>
              <div className="space-y-4">
                <Timer taskId={task._id} activeTimer={activeTimer} totalTimeSpent={task.totalTimeSpent} />
                {isAuthenticated && (
                  <select value={task.status} onChange={(event) => updateStatus(event.target.value as LearningTask['status'])} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                <InfoLine label="Priority" value={task.priority || 'medium'} />
                <InfoLine label="Confidence" value={typeof task.confidenceScore === 'number' ? `${task.confidenceScore}/10` : 'Not logged'} />
              </div>
            </aside>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <main className="space-y-4">
            {lessonSections.map((section) => (
              <ContentCard key={`${section.title}-${section.order}`} title={section.title} value={section.content} />
            ))}

            {exercises.length === 0 && (
              <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Exercises</p>
                <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No exercises saved for this task yet. Add a prompt or code exercise from the admin editor, then click Save exercises.
                </p>
              </section>
            )}

            {exercises.map((exercise, index) => (
              <section key={`${exercise.prompt}-${index}`} className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Exercise {index + 1}</p>
                    <h2 className="mt-1 text-xl font-semibold capitalize">{exercise.type} Practice</h2>
                  </div>
                  {exercise.difficulty && <span className="rounded-full border border-gray-700 px-3 py-1 text-xs capitalize text-gray-300">{exercise.difficulty}</span>}
                </div>
                <p className={`mt-4 leading-7 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{exercise.prompt}</p>
                {exercise.expectedOutput && <p className="mt-3 text-sm text-gray-500">Expected: {exercise.expectedOutput}</p>}
                {exercise.hints && exercise.hints.length > 0 && (
                  <details className="mt-4 rounded-lg border border-gray-800 bg-[#0d1426] p-3">
                    <summary className="cursor-pointer text-sm font-medium">Hints</summary>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      {exercise.hints.map((hint) => <li key={hint}>{hint}</li>)}
                    </ul>
                  </details>
                )}
                {exercise.type === 'coding' && (
                  <div className="mt-4">
                    <CodeExerciseEditor taskId={task._id} exercise={exercise} isAdmin={isAuthenticated} />
                  </div>
                )}
              </section>
            ))}

            {flashcards.length > 0 && (
              <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
                <h2 className="text-xl font-semibold">Flashcards</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {flashcards.map((card, index) => (
                    <details key={`${card.question}-${index}`} className={`rounded-lg border p-4 ${theme === 'dark' ? 'border-gray-800 bg-[#0d1426]' : 'border-gray-200 bg-gray-50'}`}>
                      <summary className="cursor-pointer font-medium">{card.question}</summary>
                      <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{card.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
              <h2 className="text-xl font-semibold">Notes and Doubts</h2>
              <div className="mt-4 space-y-3">
                {comments.length === 0 ? <p className="text-sm text-gray-500">No notes yet.</p> : comments.map((comment) => (
                  <div key={comment._id} className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-gray-800 bg-[#0d1426]' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{comment.author}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className={`mt-2 whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{comment.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="mt-4 space-y-3">
                {!isAuthenticated && (
                  <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Your name" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" required />
                )}
                <textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} rows={4} placeholder="Write a doubt, note, or explanation in your own words..." className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" required />
                <button disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">Add Note</button>
              </form>
            </section>
          </main>

          <aside className="space-y-4">
            <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
              <h2 className="text-xl font-semibold">Daily Practice Log</h2>
              {isAuthenticated ? (
                <div className="mt-4 space-y-3">
                  <textarea value={logDraft.lessonSummary} onChange={(event) => setLogDraft({ ...logDraft, lessonSummary: event.target.value })} rows={2} placeholder="What did you learn?" className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                  <textarea value={logDraft.practiceSummary} onChange={(event) => setLogDraft({ ...logDraft, practiceSummary: event.target.value })} rows={2} placeholder="What did you practice?" className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                  <textarea value={logDraft.projectConnection} onChange={(event) => setLogDraft({ ...logDraft, projectConnection: event.target.value })} rows={2} placeholder="Project or interview connection" className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                  <textarea value={logDraft.doubts} onChange={(event) => setLogDraft({ ...logDraft, doubts: event.target.value })} rows={2} placeholder="Doubts or blockers" className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                  <textarea value={logDraft.notes} onChange={(event) => setLogDraft({ ...logDraft, notes: event.target.value })} rows={3} placeholder="Daily recap" className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                  <label className="block text-sm text-gray-400">
                    Confidence: {logDraft.confidenceScore}/10
                    <input type="range" min="0" max="10" value={logDraft.confidenceScore} onChange={(event) => setLogDraft({ ...logDraft, confidenceScore: event.target.value })} className="mt-2 w-full" />
                  </label>
                  <button onClick={submitDailyLog} disabled={submitting} className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60">Save Today&apos;s Log</button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Log in as admin to save daily logs, coding attempts, and timer sessions.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getLessonSections(task: LearningTask | null) {
  if (!task) return [];
  const dynamicSections = task.lessonSections?.slice().sort((a, b) => a.order - b.order) || [];
  if (dynamicSections.length > 0) return dynamicSections;

  const legacySections = [
    task.pythonConcept ? { title: 'Python Concept', content: task.pythonConcept, order: 1 } : null,
    task.tradingConcept ? { title: 'Trading Concept', content: task.tradingConcept, order: 2 } : null,
    task.projectConnection ? { title: 'Project Connection', content: task.projectConnection, order: 3 } : null,
  ].filter(Boolean) as Array<{ title: string; content: string; order: number }>;

  return legacySections;
}

function getExercises(task: LearningTask | null) {
  if (!task) return [];
  const exercises = task.exercises?.length ? task.exercises : task.exercise ? [task.exercise] : [];
  return exercises.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
}

function ContentCard({ title, value }: { title: string; value: string }) {
  const { theme } = useTheme();
  if (!value) return null;
  return (
    <section className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-gray-800 bg-[#10182c]' : 'border-gray-300 bg-white'}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-blue-400">{title}</p>
      <p className={`mt-3 whitespace-pre-wrap leading-7 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{value}</p>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
