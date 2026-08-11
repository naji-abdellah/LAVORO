'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Building2, Briefcase, FileText, TrendingUp, Activity, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { adminApi } from "@/lib/api";

export default function AdminDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const statsResult = await adminApi.getDashboardStats();
                setStats(statsResult);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchStats();
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
                <p className="text-gray-600">Please log in to view the admin dashboard.</p>
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

    const totalUsers = stats?.totalUsers || 0;
    const totalCandidates = stats?.totalCandidates || 0;
    const totalEnterprises = stats?.totalEnterprises || 0;
    const activeJobs = stats?.activeJobs || 0;
    const totalApplications = stats?.totalApplications || 0;
    const recentUsers = stats?.recentUsers || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Platform overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Candidates</p>
                            <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Enterprises</p>
                            <p className="text-2xl font-bold text-gray-900">{totalEnterprises}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
                </div>
                <div className="p-6">
                    {recentUsers.length > 0 ? (
                        <div className="space-y-4">
                            {recentUsers.map((user: any) => {
                                // Get display name from flat fields
                                let displayName = user.email;
                                if (user.role === "CANDIDATE" && (user.firstName || user.lastName)) {
                                    displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");
                                }
                                if (user.role === "ENTERPRISE" && user.companyName) {
                                    displayName = user.companyName;
                                }

                                // Get user image from flat fields
                                let userImage = user.photoUrl;
                                if (user.role === "ENTERPRISE" && user.logoUrl) {
                                    userImage = user.logoUrl;
                                }

                                return (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {userImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={userImage}
                                                    alt={displayName}
                                                    className={`w-10 h-10 object-cover border-2 border-white shadow-sm ${user.role === "ENTERPRISE" ? "rounded-lg" : "rounded-full"}`}
                                                />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "CANDIDATE" ? "bg-green-100" : "bg-purple-100"}`}>
                                                    {user.role === "CANDIDATE" ? (
                                                        <Users className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Building2 className="w-5 h-5 text-purple-600" />
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{displayName}</p>
                                                {displayName !== user.email && (
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                )}
                                                {displayName === user.email && (
                                                    <p className="text-sm text-gray-500">{user.role}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No recent users</p>
                        </div>
                    )}
                </div>
            </div>

            {/* System Health */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <Activity className="w-8 h-8" />
                    <h2 className="text-xl font-semibold">System Status</h2>
                </div>
                <p className="text-blue-100 mb-4">All systems are operational. Jakarta EE backend is healthy.</p>
                <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{Math.round(totalApplications / Math.max(activeJobs, 1))} avg</p>
                        <p className="text-sm text-blue-200">Apps per Job</p>
                    </div>
                    <div className="text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{Math.round((totalCandidates / Math.max(totalUsers, 1)) * 100)}%</p>
                        <p className="text-sm text-blue-200">Candidates</p>
                    </div>
                    <div className="text-center">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{Math.round((totalEnterprises / Math.max(totalUsers, 1)) * 100)}%</p>
                        <p className="text-sm text-blue-200">Enterprises</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
