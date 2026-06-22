import { useEffect, useState } from 'react';
import { LearningExercise, LearningSubmission, learningApi } from '../../utils/learningApi';

interface CodeExerciseEditorProps {
  taskId: string;
  exercise: LearningExercise;
  isAdmin: boolean;
}

export default function CodeExerciseEditor({ taskId, exercise, isAdmin }: CodeExerciseEditorProps) {
  const [language, setLanguage] = useState<'javascript' | 'python'>(exercise.language || 'javascript');
  const [code, setCode] = useState(exercise.starterCode || '');
  const [submissions, setSubmissions] = useState<LearningSubmission[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LearningSubmission | null>(null);

  useEffect(() => {
    setLanguage(exercise.language || 'javascript');
    setCode(exercise.starterCode || '');
  }, [exercise.language, exercise.starterCode]);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!isAdmin) return;
      const response = await learningApi.getTaskSubmissions(taskId);
      if ('data' in response && response.data) setSubmissions(response.data);
    };

    loadSubmissions();
  }, [isAdmin, taskId]);

  const saveAttempt = async () => {
    if (!isAdmin) return;
    const response = await learningApi.createSubmission(taskId, { language, code, status: 'saved' });
    if ('data' in response && response.data) {
      setSubmissions((prev) => [response.data!, ...prev]);
      setResult(response.data);
    }
  };

  const runCode = async () => {
    if (!isAdmin) return;
    setRunning(true);
    const response = await learningApi.runSubmission(taskId, { language, code });
    if ('data' in response && response.data) {
      setResult(response.data);
      setSubmissions((prev) => [response.data!, ...prev]);
    }
    setRunning(false);
  };

  return (
    <section className="rounded-xl border border-gray-800 bg-[#10182c] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Code Practice</p>
          <h2 className="mt-1 text-xl font-semibold">Exercise Editor</h2>
        </div>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as 'javascript' | 'python')}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        className="mt-4 min-h-[260px] w-full resize-y rounded-lg border border-gray-700 bg-[#07101f] px-4 py-3 font-mono text-sm leading-6 text-gray-100 outline-none focus:border-blue-500"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={runCode}
          disabled={!isAdmin || running}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Code'}
        </button>
        <button
          onClick={saveAttempt}
          disabled={!isAdmin}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 disabled:opacity-50"
        >
          Save Attempt
        </button>
      </div>

      {!isAdmin && <p className="mt-3 text-sm text-gray-500">Log in as admin to save or run coding attempts.</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-gray-800 bg-[#0b1222] p-4">
          <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-gray-500">
            <span>Output</span>
            <span>{result.status}</span>
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-200">{result.output || result.error || 'Attempt saved.'}</pre>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-300">Previous Attempts</h3>
          <div className="mt-3 space-y-2">
            {submissions.slice(0, 5).map((submission) => (
              <button
                key={submission._id}
                onClick={() => {
                  setLanguage(submission.language);
                  setCode(submission.code);
                  setResult(submission);
                }}
                className="w-full rounded-lg border border-gray-800 bg-[#0b1222] px-3 py-2 text-left text-xs text-gray-400 hover:bg-[#111a2e]"
              >
                <span className="font-medium text-gray-200">{submission.language}</span>
                <span className="mx-2">·</span>
                <span>{submission.status}</span>
                <span className="mx-2">·</span>
                <span>{new Date(submission.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
