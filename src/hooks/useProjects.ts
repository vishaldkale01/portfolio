import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { Project, ApiErrorResponse } from '../types';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
    return 'error' in res && 'status' in res;
};

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const projectsRes = await api.get<Project[]>('/projects');
            if (isErrorResponse(projectsRes)) throw new Error(projectsRes.error);
            setProjects(projectsRes.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = async (project: Partial<Project> & { startDateStr?: string; endDateStr?: string }) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...project,
                startDate: project.startDateStr ? new Date(project.startDateStr) : undefined,
                endDate: project.endDateStr ? new Date(project.endDateStr) : undefined
            };
            const response = await api.post<Project>('/projects', dataToSubmit);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchProjects();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const updateProject = async (id: string, project: Partial<Project> & { startDateStr?: string; endDateStr?: string }) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...project,
                startDate: project.startDateStr ? new Date(project.startDateStr) : undefined,
                endDate: project.endDateStr ? new Date(project.endDateStr) : undefined
            };
            const response = await api.put<Project>(`/projects/${id}`, dataToSubmit);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchProjects();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/projects/${id}`);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchProjects();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    return {
        projects,
        loading,
        submitLoading,
        error,
        setError,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject
    };
}
