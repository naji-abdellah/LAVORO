"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Briefcase,
    MapPin,
    Building2,
    Search,
    Trash2,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    createdAt: string;
    companyName?: string;
    enterpriseId?: string;
    applicationCount?: number;
}

export default function AdminModerationPage() {
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            fetchJobs();
        }
    }, [isAuthenticated]);

    async function fetchJobs() {
        try {
            const data = await adminApi.getJobs();
            setJobs(data.jobs || []);
        } catch {
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(jobId: string) {
        if (!confirm("Are you sure you want to delete this job? This will also delete all related applications.")) {
            return;
        }

        setDeletingId(jobId);
        try {
            const res = await adminApi.deleteJob(jobId);

            if (res.success) {
                setJobs(jobs.filter(job => job.id !== jobId));
                toast.success("Job deleted successfully");
            } else {
                toast.error("Failed to delete job");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setDeletingId(null);
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                <p className="text-gray-600 mt-1">Review and moderate job postings</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by job title or company..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-yellow-800">Content Moderation Guidelines</p>
                    <p className="text-sm text-yellow-700 mt-1">
                        Delete jobs that violate platform policies, contain inappropriate content, or appear to be spam.
                    </p>
                </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
                <div className="grid gap-4">
                    {filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{job.companyName || "Unknown Company"}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.type === "CDI"
                                                ? "bg-green-100 text-green-700"
                                                : job.type === "CDD"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-purple-100 text-purple-700"
                                                }`}>
                                                {job.type}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {job.status}
                                            </span>
                                            {job.applicationCount !== undefined && (
                                                <span>{job.applicationCount} applications</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(job.id)}
                                    disabled={deletingId === job.id}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {deletingId === job.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                    Delete Job
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">
                        {searchTerm ? "Try adjusting your search" : "No jobs to moderate"}
                    </p>
                </div>
            )}
        </div>
    );
}
