import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { Experience, ApiErrorResponse } from '../types';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
    return 'error' in res && 'status' in res;
};

export function useExperiences() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExperiences = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const experiencesRes = await api.get<Experience[]>('/experiences');
            if (isErrorResponse(experiencesRes)) throw new Error(experiencesRes.error);
            setExperiences(experiencesRes.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
        } finally {
            setLoading(false);
        }
    }, []);

    const createExperience = async (experience: Partial<Experience> & { startDateStr?: string; endDateStr?: string }) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...experience,
                startDate: experience.startDateStr ? new Date(experience.startDateStr) : undefined,
                endDate: experience.endDateStr ? new Date(experience.endDateStr) : undefined
            };
            const response = await api.post<Experience>('/experiences', dataToSubmit);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchExperiences();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create experience');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const updateExperience = async (id: string, experience: Partial<Experience> & { startDateStr?: string; endDateStr?: string }) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...experience,
                startDate: experience.startDateStr ? new Date(experience.startDateStr) : undefined,
                endDate: experience.endDateStr ? new Date(experience.endDateStr) : undefined
            };
            const response = await api.put<Experience>(`/experiences/${id}`, dataToSubmit);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchExperiences();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update experience');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteExperience = async (id: string) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/experiences/${id}`);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchExperiences();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete experience');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    return {
        experiences,
        loading,
        submitLoading,
        error,
        setError,
        fetchExperiences,
        createExperience,
        updateExperience,
        deleteExperience
    };
}
