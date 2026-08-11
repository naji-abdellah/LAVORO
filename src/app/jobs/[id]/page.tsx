'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
    Briefcase,
    MapPin,
    Building2,
    ArrowLeft,
    Calendar,
    Users,
    DollarSign,
    CheckCircle,
    Sparkles,
    Loader2
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/job-recruitment-api/api';

interface JobDetails {
    id: string;
    title: string;
    description: string;
    requirements: string;
    type: string;
    salary: string;
    location: string;
    status: string;
    createdAt: string;
    applicationCount: number;
    companyName: string;
    companyDescription: string | null;
    companyIndustry: string | null;
    companyLocation: string | null;
    companyLogoUrl: string | null;
}

export default function JobDetailsPage() {
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<JobDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
                if (!response.ok) {
                    throw new Error('Job not found');
                }
                const data = await response.json();
                setJob(data.job);
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

    // Parse requirements - could be JSON array or comma-separated string
    const parseRequirements = (req: string): string[] => {
        if (!req) return [];
        try {
            const parsed = JSON.parse(req);
            if (Array.isArray(parsed)) return parsed;
            return [req];
        } catch {
            // Comma-separated string
            return req.split(',').map(s => s.trim()).filter(Boolean);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading job details...</span>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h3>
                            <p className="text-gray-600 mb-4">{error || "The job you're looking for doesn't exist or has been removed."}</p>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const requirements = parseRequirements(job.requirements);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </Link>

                    {/* Job Header Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Company Logo */}
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                {job.companyLogoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={job.companyLogoUrl}
                                        alt={job.companyName}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-10 h-10 text-blue-600" />
                                )}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.type === "CDI"
                                        ? "bg-green-100 text-green-700"
                                        : job.type === "CDD"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {job.type}
                                    </span>
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Posted {formatDate(job.createdAt)}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>

                                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        {job.companyName}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        {job.location}
                                    </span>
                                    {job.salary && (
                                        <span className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-gray-400" />
                                            {job.salary}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/auth/login"
                                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 text-center flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Apply Now
                            </Link>
                            <Link
                                href="/auth/register"
                                className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-center"
                            >
                                Create Account to Apply
                            </Link>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Job Description
                        </h2>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                        </div>
                    </div>

                    {/* Requirements */}
                    {requirements.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Requirements
                            </h2>
                            <ul className="space-y-3">
                                {requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* About Company */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            About {job.companyName}
                        </h2>
                        <div className="space-y-4">
                            {job.companyIndustry && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="font-medium">Industry:</span>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{job.companyIndustry}</span>
                                </div>
                            )}
                            {job.companyLocation && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>{job.companyLocation}</span>
                                </div>
                            )}
                            {job.companyDescription && (
                                <p className="text-gray-600">{job.companyDescription}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
