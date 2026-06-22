import { api } from './api';

// Types
export interface LearningPlan {
    _id: string;
    title: string;
    description?: string;
    goals?: string[];
    status: 'active' | 'completed' | 'paused' | 'archived';
    isPublic?: boolean;
    startDate?: string;
    targetEndDate?: string;
    actualEndDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Phase {
    _id: string;
    title: string;
    description?: string;
    order: number;
    planId: string;
    status: 'not-started' | 'in-progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface LearningTask {
    _id: string;
    priority?: 'low' | 'medium' | 'high';
    title: string;
    description?: string;
    aim?: string;
    lessonSections?: LessonSection[];
    exercise?: LearningExercise;
    exercises?: LearningExercise[];
    resources?: string[];
    flashcards?: Flashcard[];
    confidenceScore?: number;
    order?: number;
    // Legacy fields kept optional for older content.
    pythonConcept?: string;
    tradingConcept?: string;
    projectConnection?: string;
    planId: string;
    phaseId?: string;
    dueDate?: string;
    notes?: LearningTaskNote[];
    status: 'pending' | 'in-progress' | 'completed';
    completedAt?: string;
    totalTimeSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface LessonSection {
    title: string;
    content: string;
    order: number;
}

export interface LearningExercise {
    type: 'coding' | 'reading' | 'quiz' | 'project' | 'debugging';
    language?: 'javascript' | 'python';
    prompt: string;
    starterCode?: string;
    expectedOutput?: string;
    testCases?: Array<{
        input: string;
        expectedOutput: string;
    }>;
    hints?: string[];
    solution?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    order?: number;
}

export interface Flashcard {
    question: string;
    answer: string;
}

export interface LearningTaskNote {
    content: string;
    createdAt: string;
}

export interface DailyLearningLog {
    _id: string;
    planId: string;
    taskId?: string | { _id: string; title: string };
    date: string;
    lessonSummary?: string;
    practiceSummary?: string;
    projectConnection?: string;
    doubts?: string;
    notes?: string;
    confidenceScore?: number;
    createdAt: string;
    updatedAt: string;
}

export interface TimeLog {
    _id: string;
    taskId: string;
    startTime: string;
    endTime?: string;
    duration: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PlanDetail {
    plan: LearningPlan;
    phases: Phase[];
    tasks: LearningTask[];
}

export interface DailyStats {
    date: string;
    totalSeconds: number;
    totalHours: string;
    sessionsCount: number;
    timeLogs: TimeLog[];
}

export interface WeeklyStats {
    weekStart: string;
    weekEnd: string;
    totalSeconds: number;
    totalHours: string;
    sessionsCount: number;
    dailyBreakdown: { [key: string]: number };
}

export interface PlanStats {
    planId: string;
    totalSeconds: number;
    totalHours: string;
    totalTasks: number;
    completedTasks: number;
    taskBreakdown: Array<{
        taskId: string;
        title: string;
        totalTimeSpent: number;
        totalHours: string;
        status: string;
    }>;
}

export interface TaskComment {
    _id: string;
    taskId: string;
    content: string;
    author: string;
    isAdminComment: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LearningSubmission {
    _id: string;
    planId: string;
    phaseId?: string;
    taskId: string;
    language: 'javascript' | 'python';
    code: string;
    output?: string;
    error?: string;
    status: 'saved' | 'success' | 'error' | 'timeout';
    executionTimeMs?: number;
    createdAt: string;
    updatedAt: string;
}

// ========== Learning Plans ==========
export const learningApi = {
    // Get all plans
    getAllPlans: (includeHidden = false) =>
        api.get<LearningPlan[]>(`/learning/plans${includeHidden ? '?includeHidden=true' : ''}`),

    // Get single plan with details
    getPlanById: (id: string, includeHidden = false) =>
        api.get<PlanDetail>(`/learning/plans/${id}${includeHidden ? '?includeHidden=true' : ''}`),

    // Create plan (admin only)
    createPlan: (plan: Partial<LearningPlan>) =>
        api.post<LearningPlan>('/learning/plans', plan),

    // Update plan (admin only)
    updatePlan: (id: string, plan: Partial<LearningPlan>) =>
        api.put<LearningPlan>(`/learning/plans/${id}`, plan),

    // Delete plan (admin only)
    deletePlan: (id: string) =>
        api.delete(`/learning/plans/${id}`),

    // Seed Python + Stock Market + Algo Project roadmap (admin only)
    seedPythonAlgoRoadmap: () =>
        api.post<{ message: string; plan: LearningPlan; phasesCreated: number; tasksCreated: number }>('/learning/seed/python-algo-roadmap', {}),

    // Daily learning logs
    getDailyLogs: (planId: string, limit = 30) =>
        api.get<DailyLearningLog[]>(`/learning/plans/${planId}/daily-logs?limit=${limit}`),

    createDailyLog: (planId: string, log: Partial<DailyLearningLog>) =>
        api.post<DailyLearningLog>(`/learning/plans/${planId}/daily-logs`, log),

    // ========== Phases ==========

    // Create phase (admin only)
    createPhase: (phase: Partial<Phase>) =>
        api.post<Phase>('/learning/phases', phase),

    // Update phase (admin only)
    updatePhase: (id: string, phase: Partial<Phase>) =>
        api.put<Phase>(`/learning/phases/${id}`, phase),

    // Delete phase (admin only)
    deletePhase: (id: string) =>
        api.delete(`/learning/phases/${id}`),

    // ========== Tasks ==========

    // Create task (admin only)
    createTask: (task: Partial<LearningTask>) =>
        api.post<LearningTask>('/learning/tasks', task),

    // Update task (admin only)
    updateTask: (id: string, task: Partial<LearningTask>) =>
        api.put<LearningTask>(`/learning/tasks/${id}`, task),

    // Delete task (admin only)
    deleteTask: (id: string) =>
        api.delete(`/learning/tasks/${id}`),

    // Add task note (admin only)
    addTaskNote: (id: string, content: string) =>
        api.post<LearningTask>(`/learning/tasks/${id}/notes`, { content }),

    getTaskSubmissions: (taskId: string) =>
        api.get<LearningSubmission[]>(`/learning/tasks/${taskId}/submissions`),

    createSubmission: (taskId: string, submission: Partial<LearningSubmission>) =>
        api.post<LearningSubmission>(`/learning/tasks/${taskId}/submissions`, submission),

    runSubmission: (taskId: string, payload: { language: 'javascript' | 'python'; code: string }) =>
        api.post<LearningSubmission>(`/learning/tasks/${taskId}/run`, payload),
};

// ========== Time Tracking ==========
export const timeApi = {
    // Start timer (admin only)
    startTimer: (taskId: string) =>
        api.post<TimeLog>('/time/start', { taskId }),

    // Stop timer (admin only)
    stopTimer: (taskId: string) =>
        api.post<TimeLog>('/time/stop', { taskId }),

    // Get active timer
    getActiveTimer: (taskId: string) =>
        api.get<{ activeTimer: TimeLog | null }>(`/time/task/${taskId}/active`),

    // Get time logs for a task
    getTaskTimeLogs: (taskId: string) =>
        api.get<TimeLog[]>(`/time/task/${taskId}/logs`),

    // Get daily stats
    getDailyStats: (date?: string) =>
        api.get<DailyStats>(`/time/stats/daily${date ? `?date=${date}` : ''}`),

    // Get weekly stats
    getWeeklyStats: (startDate?: string) =>
        api.get<WeeklyStats>(`/time/stats/weekly${startDate ? `?startDate=${startDate}` : ''}`),

    // Get plan stats
    getPlanStats: (planId: string) =>
        api.get<PlanStats>(`/time/stats/plan/${planId}`),
};

// ========== Comments ==========
export const commentApi = {
    // Get all comments for a task (public)
    getTaskComments: (taskId: string) =>
        api.get<TaskComment[]>(`/comments/task/${taskId}`),

    // Add comment to task (public)
    addComment: (taskId: string, content: string, author: string) =>
        api.post<TaskComment>(`/comments/task/${taskId}`, { content, author }),

    // Add admin comment (admin only)
    addAdminComment: (taskId: string, content: string, author?: string) =>
        api.post<TaskComment>(`/comments/task/${taskId}/admin`, { content, author }),

    // Delete comment (admin only)
    deleteComment: (commentId: string) =>
        api.delete(`/comments/${commentId}`),
};
