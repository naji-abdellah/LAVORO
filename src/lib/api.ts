// API Client for Jakarta EE Backend
// This replaces the Prisma client with HTTP calls to the Jakarta EE API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/job-recruitment-api/api';

// Token storage (in production, use httpOnly cookies)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }
}

export function getAuthToken(): string | null {
    if (authToken) return authToken;
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        // Handle potential "undefined" string in localStorage
        if (token === 'undefined') {
            localStorage.removeItem('authToken');
            return null;
        }
        return token;
    }
    return null;
}

async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Auth API
export const authApi = {
    async register(data: {
        email: string;
        password: string;
        role: 'CANDIDATE' | 'ENTERPRISE';
        firstName?: string;
        lastName?: string;
        skills?: string;
        bio?: string;
        phone?: string;
        address?: string;
        companyName?: string;
        description?: string;
        industry?: string;
        location?: string;
    }) {
        const response = await fetchAPI<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        setAuthToken(response.token);
        return response;
    },

    async login(email: string, password: string) {
        const response = await fetchAPI<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setAuthToken(response.token);
        return response;
    },

    logout() {
        setAuthToken(null);
    },
};

// Jobs API
export const jobsApi = {
    async getJobs(filters?: { type?: string; location?: string; search?: string }) {
        const params = new URLSearchParams();
        if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters?.location) params.append('location', filters.location);
        if (filters?.search) params.append('search', filters.search);

        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchAPI<{ jobs: any[] }>(`/jobs${query}`);
    },

    async getJobById(id: string) {
        return fetchAPI<{ job: any }>(`/jobs/${id}`);
    },

    async apply(jobId: string) {
        return fetchAPI<{ success: boolean; matchingScore: number }>('/jobs/apply', {
            method: 'POST',
            body: JSON.stringify({ jobId }),
        });
    },
};

// Enterprise API
export const enterpriseApi = {
    async getDashboard() {
        return fetchAPI<any>('/enterprise/dashboard');
    },

    async getJobs() {
        return fetchAPI<{ jobs: any[] }>('/enterprise/jobs');
    },

    async createJob(data: {
        title: string;
        description: string;
        type: string;
        salary: string;
        location: string;
        requirements: string;
    }) {
        return fetchAPI<{ success: boolean; jobId: string }>('/enterprise/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateJob(id: string, data: any) {
        return fetchAPI<{ success: boolean }>(`/enterprise/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteJob(id: string) {
        return fetchAPI<{ success: boolean }>(`/enterprise/jobs/${id}`, {
            method: 'DELETE',
        });
    },

    async toggleJobStatus(id: string, status: string) {
        return fetchAPI<{ success: boolean }>(`/enterprise/jobs/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    async getApplications() {
        return fetchAPI<{ applications: any[] }>('/enterprise/applications');
    },

    async updateApplicationStatus(applicationId: string, status: string) {
        return fetchAPI<{ success: boolean }>('/enterprise/applications', {
            method: 'PUT',
            body: JSON.stringify({ applicationId, status }),
        });
    },

    async scheduleInterview(applicationId: string, date: string, meetingLink: string) {
        return fetchAPI<{ success: boolean }>('/enterprise/applications/interview', {
            method: 'POST',
            body: JSON.stringify({ applicationId, date, meetingLink }),
        });
    },

    async getDashboardStats() {
        return fetchAPI<any>('/enterprise/dashboard');
    },

    async getProfile() {
        return fetchAPI<{ profile: any }>('/enterprise/profile');
    },

    async updateProfile(data: any) {
        return fetchAPI<{ success: boolean }>('/enterprise/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// Candidate API
export const candidateApi = {
    async getDashboard() {
        return fetchAPI<any>('/candidate/dashboard');
    },

    async getApplications() {
        return fetchAPI<{ applications: any[] }>('/candidate/applications');
    },

    async getDashboardStats() {
        return fetchAPI<any>('/candidate/dashboard');
    },
};

// Admin API
export const adminApi = {
    async getUsers() {
        return fetchAPI<{ users: any[] }>('/admin/users');
    },

    async updateUserStatus(userId: string, isActive: boolean, reason?: string) {
        return fetchAPI<{ success: boolean }>('/admin/users', {
            method: 'PATCH',
            body: JSON.stringify({ userId, isActive, deactivationReason: reason }),
        });
    },

    async deleteUser(userId: string) {
        return fetchAPI<{ success: boolean }>(`/admin/users/${userId}`, {
            method: 'DELETE',
        });
    },

    async getJobs() {
        return fetchAPI<{ jobs: any[] }>('/admin/jobs');
    },

    async deleteJob(id: string) {
        return fetchAPI<{ success: boolean }>(`/admin/jobs/${id}`, {
            method: 'DELETE',
        });
    },

    async getUserById(id: string) {
        return fetchAPI<any>(`/admin/users/${id}`);
    },

    async getApplications() {
        return fetchAPI<{ applications: any[] }>('/admin/applications');
    },

    async updateApplicationStatus(applicationId: string, status: string) {
        return fetchAPI<{ success: boolean }>('/admin/applications', {
            method: 'PATCH',
            body: JSON.stringify({ applicationId, status }),
        });
    },

    async toggleApplicationAnonymity(applicationId: string, isAnonymous: boolean) {
        return fetchAPI<{ success: boolean }>('/admin/applications', {
            method: 'PATCH',
            body: JSON.stringify({ applicationId, isAnonymous }),
        });
    },

    async deleteApplication(applicationId: string) {
        return fetchAPI<{ success: boolean }>(`/admin/applications/${applicationId}`, {
            method: 'DELETE',
        });
    },

    async getInterviews() {
        return fetchAPI<{ interviews: any[] }>('/admin/interviews');
    },

    async updateInterviewStatus(interviewId: string, status: string) {
        return fetchAPI<{ success: boolean }>('/admin/interviews', {
            method: 'PATCH',
            body: JSON.stringify({ interviewId, status }),
        });
    },

    async updateInterview(interviewId: string, date: string, meetingLink: string) {
        return fetchAPI<{ success: boolean }>('/admin/interviews', {
            method: 'PATCH',
            body: JSON.stringify({ interviewId, date, meetingLink }),
        });
    },

    async deleteInterview(interviewId: string) {
        return fetchAPI<{ success: boolean }>(`/admin/interviews`, {
            method: 'DELETE',
            body: JSON.stringify({ interviewId }),
        });
    },

    async getDashboardStats() {
        return fetchAPI<any>('/admin/dashboard');
    },
};

// Notifications API
export const notificationsApi = {
    async getNotifications() {
        return fetchAPI<{ notifications: any[]; unreadCount: number }>('/notifications');
    },

    async markAsRead(id: string) {
        return fetchAPI<{ success: boolean }>(`/notifications/${id}/read`, {
            method: 'PUT',
        });
    },

    async markAllAsRead() {
        return fetchAPI<{ success: boolean }>('/notifications/read-all', {
            method: 'PUT',
        });
    },
};

// Profile API
export const profileApi = {
    async getProfile() {
        return fetchAPI<{ user: any }>('/profile');
    },

    async updateProfile(data: any) {
        return fetchAPI<{ success: boolean }>('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// User Info API
export const userApi = {
    async getInfo() {
        return fetchAPI<{ id: string; email: string; role: string; isActive: boolean }>('/user/info');
    },
};
