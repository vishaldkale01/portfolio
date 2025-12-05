import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LearningTask, TaskComment, commentApi, learningApi } from '../utils/learningApi';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';
import { Button } from '../components/Button';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated } = useAdmin();
  
  const [task, setTask] = useState<LearningTask | null>(null);
  const [allTasks, setAllTasks] = useState<LearningTask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Navigation logic
  const currentIndex = allTasks.findIndex(t => t._id === taskId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTasks.length - 1;

  useEffect(() => {
    fetchTaskAndRelated();
  }, [taskId]);

  const fetchTaskAndRelated = async () => {
    setLoading(true);
    try {
      // Fetch all tasks to enable navigation
      const tasksResponse = await learningApi.getAllPlans();
      if ('data' in tasksResponse && tasksResponse.data) {
        const plans = tasksResponse.data;
        const allTasksList: LearningTask[] = [];
        
        // Collect all tasks from all plans
        for (const plan of plans) {
          const planDetail = await learningApi.getPlanById(plan._id);
          if ('data' in planDetail && planDetail.data) {
            allTasksList.push(...planDetail.data.tasks);
          }
        }
        setAllTasks(allTasksList);
        
        // Find current task
        const currentTask = allTasksList.find(t => t._id === taskId);
        if (currentTask) {
          setTask(currentTask);
          fetchComments(taskId!);
        }
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id: string) => {
    try {
      const response = await commentApi.getTaskComments(id);
      
      if (response && 'data' in response) {
        const actualData = response.data;
        if (actualData && typeof actualData === 'object' && 'data' in actualData && Array.isArray(actualData.data)) {
          setComments(actualData.data);
        } else if (Array.isArray(actualData)) {
          setComments(actualData);
        } else {
          setComments([]);
        }
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/task/${allTasks[currentIndex - 1]._id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigate(`/task/${allTasks[currentIndex + 1]._id}`);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || (!isAuthenticated && !authorName.trim())) return;

    setSubmitting(true);
    try {
      if (isAuthenticated) {
        await commentApi.addAdminComment(taskId!, newComment, authorName || 'Admin');
      } else {
        await commentApi.addComment(taskId!, newComment, authorName);
      }
      setNewComment('');
      if (!isAuthenticated) setAuthorName('');
      await fetchComments(taskId!);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentApi.deleteComment(commentId);
      await fetchComments(taskId!);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-xl text-gray-400">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-xl text-red-400">Task not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header with Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-4">{task.title}</h1>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <span className={`px-3 py-1 rounded-full ${
                task.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {task.status}
              </span>
              <span className="text-gray-400">⏱️ {formatTime(task.totalTimeSpent)}</span>
              
              {allTasks.length > 1 && (
                <span className="text-gray-400 text-xs">
                  Task {currentIndex + 1} of {allTasks.length}
                </span>
              )}
            </div>

            {/* Navigation Buttons */}
            {allTasks.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    hasPrevious
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                      : 'bg-gray-700/20 text-gray-600 cursor-not-allowed border border-gray-700/30'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Task
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    hasNext
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                      : 'bg-gray-700/20 text-gray-600 cursor-not-allowed border border-gray-700/30'
                  }`}
                >
                  Next Task
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-6"
        >
          {task.description && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Description</h3>
              <p className="text-gray-300">{task.description}</p>
            </div>
          )}

          {task.aim && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Aim</h3>
              <p className="text-gray-300">{task.aim}</p>
            </div>
          )}

          <div className="text-sm text-gray-400">
            Created: {new Date(task.createdAt).toLocaleString()}
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Comments ({comments.length})
          </h3>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    comment.isAdminComment
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'bg-gray-700/50 border border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`font-semibold ${
                        comment.isAdminComment ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        {comment.author}
                        {comment.isAdminComment && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="ml-3 text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-400 hover:text-red-300 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-4">
            {!isAuthenticated && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                className={`w-full p-3 ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                required
              />
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              className={`w-full p-3 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-colors`}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={submitting}
                loadingText="Posting..."
              >
                Post Comment
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
