'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobsApi, authApi, enterpriseApi, candidateApi, notificationsApi, getAuthToken, setAuthToken } from './api';

// Auth hook
export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const token = getAuthToken();
        if (token) {
            // Decode token to get user info (basic JWT decode)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.sub,
                    role: payload.role,
                    email: payload.email
                });
            } catch {
                setAuthToken(null);
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await authApi.login(email, password);
            const payload = JSON.parse(atob(result.token.split('.')[1]));
            setUser({
                id: payload.sub,
                role: payload.role,
                email: payload.email
            });
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const result = await authApi.register(data);
            const payload = JSON.parse(atob(result.token.split('.')[1]));
            setUser({
                id: payload.sub,
                role: payload.role,
                email: payload.email
            });
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authApi.logout();
        setUser(null);
    }, []);

    return { user, loading, error, login, register, logout };
}

// Jobs hook
export function useJobs(filters?: { type?: string; location?: string; search?: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await jobsApi.getJobs(filters);
            setJobs(result.jobs || []);
        } catch (err: any) {
            setError(err.message);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [filters?.type, filters?.location, filters?.search]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return { jobs, loading, error, refetch: fetchJobs };
}

// Single job hook
export function useJob(jobId: string) {
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const result = await jobsApi.getJobById(jobId);
                setJob(result.job);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    return { job, loading, error };
}

// Enterprise jobs hook
export function useEnterpriseJobs() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await enterpriseApi.getJobs();
            setJobs(result.jobs || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const createJob = async (data: any) => {
        try {
            const result = await enterpriseApi.createJob(data);
            await fetchJobs();
            return result;
        } catch (err: any) {
            return { error: err.message };
        }
    };

    const deleteJob = async (jobId: string) => {
        try {
            await enterpriseApi.deleteJob(jobId);
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return { jobs, loading, error, refetch: fetchJobs, createJob, deleteJob };
}

// Candidate applications hook
export function useCandidateApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await candidateApi.getApplications();
            setApplications(result.applications || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const applyToJob = async (jobId: string) => {
        try {
            const result = await jobsApi.apply(jobId);
            await fetchApplications();
            return result;
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return { applications, loading, error, refetch: fetchApplications, applyToJob };
}

// Notifications hook
export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const result = await notificationsApi.getNotifications();
            setNotifications(result.notifications || []);
            setUnreadCount(result.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    return { notifications, unreadCount, loading, refetch: fetchNotifications, markAsRead };
}
