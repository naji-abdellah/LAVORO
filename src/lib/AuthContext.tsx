'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, profileApi, getAuthToken, setAuthToken } from './api';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'CANDIDATE' | 'ENTERPRISE';
    photoUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    logoUrl?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
    register: (data: any) => Promise<{ success?: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch full user profile from API
    const fetchUserProfile = async (basicUser: { id: string; email: string; role: 'ADMIN' | 'CANDIDATE' | 'ENTERPRISE' }) => {
        try {
            const data = await profileApi.getProfile();
            const profile = data.user;

            setUser({
                id: basicUser.id,
                email: basicUser.email,
                role: basicUser.role,
                photoUrl: profile.photoUrl || null,
                firstName: profile.firstName || null,
                lastName: profile.lastName || null,
                companyName: profile.companyName || null,
                logoUrl: profile.logoUrl || null,
            });
        } catch {
            // If profile fetch fails, use basic user info
            setUser(basicUser);
        }
    };

    // Refresh user data from API (call this after profile updates)
    const refreshUser = useCallback(async () => {
        const token = getAuthToken();
        if (!token || !user) return;

        try {
            const data = await profileApi.getProfile();
            const profile = data.user;

            setUser(prev => prev ? {
                ...prev,
                photoUrl: profile.photoUrl || null,
                firstName: profile.firstName || null,
                lastName: profile.lastName || null,
                companyName: profile.companyName || null,
                logoUrl: profile.logoUrl || null,
            } : null);
        } catch (err) {
            console.error('Failed to refresh user profile:', err);
        }
    }, [user]);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    // Check if token is expired
                    if (payload.exp && payload.exp * 1000 > Date.now()) {
                        const basicUser = {
                            id: payload.sub,
                            email: payload.email || '',
                            role: payload.role as 'ADMIN' | 'CANDIDATE' | 'ENTERPRISE'
                        };
                        await fetchUserProfile(basicUser);
                    } else {
                        setAuthToken(null);
                    }
                } catch {
                    setAuthToken(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await authApi.login(email, password);
            const payload = JSON.parse(atob(result.token.split('.')[1]));
            const basicUser = {
                id: payload.sub,
                email: payload.email || email,
                role: payload.role as 'ADMIN' | 'CANDIDATE' | 'ENTERPRISE'
            };
            await fetchUserProfile(basicUser);
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
            const basicUser = {
                id: payload.sub,
                email: payload.email || data.email,
                role: payload.role as 'ADMIN' | 'CANDIDATE' | 'ENTERPRISE'
            };
            await fetchUserProfile(basicUser);
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

    // Helper to get display name
    const getDisplayName = () => {
        if (!user) return '';
        if (user.role === 'ENTERPRISE' && user.companyName) {
            return user.companyName;
        }
        if (user.firstName || user.lastName) {
            return [user.firstName, user.lastName].filter(Boolean).join(' ');
        }
        return user.email;
    };

    // Helper to get user image
    const getUserImage = () => {
        if (!user) return null;
        if (user.role === 'ENTERPRISE' && user.logoUrl) {
            return user.logoUrl;
        }
        return user.photoUrl;
    };

    return (
        <AuthContext.Provider value={{
            user: user ? { ...user, displayName: getDisplayName(), userImage: getUserImage() } as any : null,
            loading,
            error,
            login,
            register,
            logout,
            refreshUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles?: ('ADMIN' | 'CANDIDATE' | 'ENTERPRISE')[]
) {
    return function ProtectedComponent(props: P) {
        const { user, loading, isAuthenticated } = useAuth();

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/signin';
            }
            return null;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}
