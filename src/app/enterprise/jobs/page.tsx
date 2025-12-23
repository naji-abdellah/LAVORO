"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Plus,
    Briefcase,
    MapPin,
    Users,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2
} from "lucide-react";
import { enterpriseApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    salary: string | null;
    createdAt: string;
    applicationCount: number;
}

export default function EnterpriseJobsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchJobs();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated]);

    async function fetchJobs() {
        try {
            const data = await enterpriseApi.getJobs();
            setJobs(data.jobs || []);
        } catch {
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(jobId: string) {
        if (!confirm("Are you sure you want to delete this job?")) return;

        setDeletingId(jobId);
        try {
            const res = await enterpriseApi.deleteJob(jobId);

            if (res.success) {
                setJobs(jobs.filter((job) => job.id !== jobId));
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

    async function handleToggleStatus(jobId: string, currentStatus: string) {
        setTogglingId(jobId);
        const newStatus = currentStatus === "ACTIVE" ? "CLOSED" : "ACTIVE";

        try {
            const res = await enterpriseApi.toggleJobStatus(jobId, newStatus);

            if (res.success) {
                setJobs(jobs.map((job) =>
                    job.id === jobId ? { ...job, status: newStatus } : job
                ));
                toast.success(`Job ${newStatus === "ACTIVE" ? "activated" : "closed"}`);
            } else {
                toast.error("Failed to update job status");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setTogglingId(null);
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Job Offers</h1>
                    <p className="text-gray-600 mt-1">Manage your job postings</p>
                </div>
                <Link
                    href="/enterprise/jobs/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Create Job
                </Link>
            </div>

            {jobs.length > 0 ? (
                <div className="grid gap-4">
                    {jobs.map((job) => (
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
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applicationCount} applications
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggleStatus(job.id, job.status)}
                                        disabled={togglingId === job.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${job.status === "ACTIVE"
                                            ? "text-green-700 bg-green-50 hover:bg-green-100"
                                            : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                                            }`}
                                    >
                                        {togglingId === job.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : job.status === "ACTIVE" ? (
                                            <ToggleRight className="w-5 h-5" />
                                        ) : (
                                            <ToggleLeft className="w-5 h-5" />
                                        )}
                                        {job.status === "ACTIVE" ? "Active" : "Closed"}
                                    </button>

                                    {/* Edit link will need page update too, assuming it exists */}
                                    <Link
                                        href={`/enterprise/jobs/${job.id}/edit`}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        disabled={deletingId === job.id}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === job.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No job offers yet</h3>
                    <p className="text-gray-600 mb-6">Create your first job posting to start receiving applications</p>
                    <Link
                        href="/enterprise/jobs/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Job
                    </Link>
                </div>
            )}
        </div>
    );
}
