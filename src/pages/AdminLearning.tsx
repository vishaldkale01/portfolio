import LearningManagementPanel from '../components/learning/LearningManagementPanel';

export default function AdminLearning() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Learning Management
        </h1>
        <LearningManagementPanel />
      </div>
    </div>
  );
}
