import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { Contact, ApiErrorResponse } from '../types';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
    return 'error' in res && 'status' in res;
};

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const contactsRes = await api.get<Contact[]>('/contact');
            if (isErrorResponse(contactsRes)) throw new Error(contactsRes.error);
            setContacts(contactsRes.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    }, []);

    const replyToContact = async (id: string, reply: string) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.post(`/contact/${id}/reply`, { reply });
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchContacts();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reply to contact');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteContact = async (id: string) => {
        setSubmitLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/contact/${id}`);
            if (isErrorResponse(response)) throw new Error(response.error);
            await fetchContacts();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete contact');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    return {
        contacts,
        loading,
        submitLoading,
        error,
        setError,
        fetchContacts,
        replyToContact,
        deleteContact
    };
}
