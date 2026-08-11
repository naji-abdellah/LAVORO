"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    FileText,
    Building2,
    MapPin,
    Calendar,
    ExternalLink,
    Clock,
    Loader2
} from "lucide-react";
import { candidateApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { formatDate } from "@/lib/utils"; // Make sure this utility works client-side or define it locally

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

interface Application {
    id: string;
    status: string;
    matchingScore: number;
    createdAt: string;
    jobTitle: string;
    jobLocation: string;
    companyName: string;
    interviewDate: string | null;
    interviewLink: string | null;
}

export default function CandidateApplicationsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchApplications();
        } else if (!authLoading && !isAuthenticated) {
            setIsLoading(false); // Stop loading if not auth, although layout handles redirect normally
        }
    }, [authLoading, isAuthenticated]);

    async function fetchApplications() {
        try {
            const result = await candidateApi.getApplications();
            // Map the API response to our local interface if needed, or rely on API matching
            // The API returns { applications: [...] }
            // Let's assume the API returns data matching what we need or we map it
            // Based on previous JSON structure inspection or assumption:
            // API likely returns application object with flattened or nested DTOs.
            // Let's use the response directly and adjust if fields mismatch.
            // Checking api.ts -> fetchAPI<{ applications: any[] }>
            setApplications(result.applications || []);
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setIsLoading(false);
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // or redirect, handled by layout/middleware usually
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-1">Track the status of your job applications</p>
            </div>

            {applications.length > 0 ? (
                <div className="grid gap-4">
                    {applications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {application.jobTitle}
                                        </h3>
                                        <p className="text-gray-600">{application.companyName || "Company"}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {application.jobLocation}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Applied {new Date(application.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                        {application.status ? application.status.replace("_", " ") : "UNKNOWN"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Match: <span className="font-semibold text-blue-600">{application.matchingScore}%</span>
                                    </span>
                                </div>
                            </div>

                            {/* Interview details */}
                            {application.interviewDate && (
                                <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-purple-900">Interview Scheduled</p>
                                            <p className="text-sm text-purple-700">
                                                {new Date(application.interviewDate).toLocaleString()}
                                            </p>
                                        </div>
                                        {application.interviewLink && (
                                            <a
                                                href={application.interviewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Join Meeting
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6">Start applying to jobs to track your applications here</p>
                    <Link
                        href="/candidate/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Browse Jobs
                    </Link>
                </div>
            )}
        </div>
    );
}
