'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
    Briefcase,
    FileText,
    Clock,
    Calendar,
    ArrowRight,
    Plus,
    User,
    Loader2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { enterpriseApi } from "@/lib/api";

function getStatusColor(status: string) {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'REVIEWED': return 'bg-blue-100 text-blue-700';
        case 'ACCEPTED': return 'bg-green-100 text-green-700';
        case 'REJECTED': return 'bg-red-100 text-red-700';
        case 'INTERVIEW': return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

export default function EnterpriseDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const statsResult = await enterpriseApi.getDashboardStats();
                setStats(statsResult);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your job offers and applications</p>
                </div>
                <Link
                    href="/enterprise/jobs/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
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
                            <p className="text-sm text-gray-600">Pending Review</p>
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
                            <p className="text-2xl font-bold text-gray-900">{stats?.scheduledInterviews || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                        <Link href="/enterprise/applications" className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentApplications.map((application: any) => {
                                const firstName = application.candidateFirstName || "";
                                const lastName = application.candidateLastName || "";
                                const displayName = (firstName || lastName)
                                    ? `${firstName} ${lastName}`.trim()
                                    : (application.candidateEmail || 'Candidate');
                                const photoUrl = application.candidatePhotoUrl || null;

                                return (
                                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={photoUrl}
                                                    alt={displayName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{displayName}</p>
                                                <p className="text-sm text-gray-600">{application.jobTitle || 'Position'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-blue-600">
                                                {application.matchingScore || 0}% match
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                {application.status?.replace("_", " ") || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No applications yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link
                    href="/enterprise/jobs"
                    className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all group"
                >
                    <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        Manage Job Offers
                    </h3>
                    <p className="text-gray-600 text-sm">Create, edit, and manage your job postings</p>
                </Link>

                <Link
                    href="/enterprise/applications"
                    className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-all group"
                >
                    <FileText className="w-10 h-10 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        View Applications
                    </h3>
                    <p className="text-gray-600 text-sm">Review candidates and schedule interviews</p>
                </Link>
            </div>
        </div>
    );
}
