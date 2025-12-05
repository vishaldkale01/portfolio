import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Skill, ApiErrorResponse } from '../types';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
    return 'error' in res && 'status' in res;
};

export function useSkills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSkills = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const skillsRes = await api.get<Skill[]>('/skills');
            if (isErrorResponse(skillsRes)) throw new Error(skillsRes.error);
            setSkills(skillsRes.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    useEffect(() => {
        const uniqueCategories = [...new Set(skills.map(skill => skill.category))].filter(Boolean);
        setCategories(uniqueCategories);
    }, [skills]);

    const createSkill = async (skill: Partial<Skill>) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.post<Skill>('/skills', skill);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchSkills();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create skill');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const updateSkill = async (id: string, skill: Partial<Skill>) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.put<Skill>(`/skills/${id}`, skill);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchSkills();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update skill');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteSkill = async (id: string) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/skills/${id}`);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchSkills();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete skill');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const addCategory = (category: string) => {
        if (category.trim()) {
            setCategories(prev => [...prev, category.trim()]);
        }
    };

    return {
        skills,
        categories,
        loading,
        submitLoading,
        error,
        setError,
        fetchSkills,
        createSkill,
        updateSkill,
        deleteSkill,
        addCategory
    };
}
