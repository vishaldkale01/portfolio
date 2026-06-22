import { useState } from 'react';
import LearningManagementPanel from '../components/learning/LearningManagementPanel';
import { learningApi } from '../utils/learningApi';

export default function AdminLearning() {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const seedRoadmap = async () => {
    setSeeding(true);
    setSeedMessage('');
    const response = await learningApi.seedPythonAlgoRoadmap();
    if ('error' in response) setSeedMessage(response.error || 'Unable to seed roadmap');
    else if (response.data) setSeedMessage(`${response.data.message}. Tasks created: ${response.data.tasksCreated}`);
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Learning Management
            </h1>
            {seedMessage && <p className="mt-2 text-sm text-blue-200">{seedMessage}</p>}
          </div>
          <button
            onClick={seedRoadmap}
            disabled={seeding}
            className="rounded-lg border border-blue-400/30 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {seeding ? 'Creating roadmap...' : 'Create Developer Practice Roadmap'}
          </button>
        </div>
        <LearningManagementPanel />
      </div>
    </div>
  );
}
