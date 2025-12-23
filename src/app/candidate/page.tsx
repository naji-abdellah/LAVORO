'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
    FileText,
    Clock,
    Calendar,
    CheckCircle,
    ArrowRight,
    Briefcase,
    Bell,
    ExternalLink,
    Loader2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { candidateApi, notificationsApi } from "@/lib/api";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function CandidateDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                // Fetch dashboard stats
                const statsResult = await candidateApi.getDashboardStats();
                setStats(statsResult);

                // Fetch notifications
                const notifResult = await notificationsApi.getNotifications();
                setNotifications(notifResult.notifications?.filter((n: any) => !n.read).slice(0, 5) || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchDashboardData();
        }
    }, [isAuthenticated, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Please log in to view your dashboard.</p>
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Go to Login
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading dashboard: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here&apos;s an overview of your job search.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Interviews</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.interviews || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Accepted</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.acceptedApplications || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upcoming Interviews */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
                            <Link href="/candidate/applications" className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats?.upcomingInterviews && stats.upcomingInterviews.length > 0 ? (
                            <div className="space-y-4">
                                {stats.upcomingInterviews.map((interview: any) => (
                                    <div key={interview.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {interview.jobTitle || 'Interview'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {interview.companyName || 'Company'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatDate(interview.date)}
                                            </p>
                                        </div>
                                        {interview.meetingLink && (
                                            <a
                                                href={interview.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700"
                                            >
                                                Join <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No upcoming interviews</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                            <Link href="/candidate/notifications" className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {notifications.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Bell className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{notification.content}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <h2 className="text-xl font-semibold mb-4">Ready to find your next opportunity?</h2>
                <p className="text-blue-100 mb-6">Browse through hundreds of job listings and apply with one click.</p>
                <Link
                    href="/candidate/jobs"
                    className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                    <Briefcase className="w-5 h-5" />
                    Browse Jobs
                </Link>
            </div>
        </div>
    );
}
