import { api } from './api';

// Types
export interface LearningPlan {
    _id: string;
    title: string;
    description?: string;
    goals?: string[];
    status: 'active' | 'completed' | 'paused' | 'archived';
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
    title: string;
    description?: string;
    aim?: string;
    planId: string;
    phaseId?: string;
    status: 'pending' | 'in-progress' | 'completed';
    totalTimeSpent: number;
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

// ========== Learning Plans ==========
export const learningApi = {
    // Get all plans
    getAllPlans: () => api.get<LearningPlan[]>('/learning/plans'),

    // Get single plan with details
    getPlanById: (id: string) => api.get<PlanDetail>(`/learning/plans/${id}`),

    // Create plan (admin only)
    createPlan: (plan: Partial<LearningPlan>) =>
        api.post<LearningPlan>('/learning/plans', plan),

    // Update plan (admin only)
    updatePlan: (id: string, plan: Partial<LearningPlan>) =>
        api.put<LearningPlan>(`/learning/plans/${id}`, plan),

    // Delete plan (admin only)
    deletePlan: (id: string) =>
        api.delete(`/learning/plans/${id}`),

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
