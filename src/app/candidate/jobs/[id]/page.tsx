"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { jobsApi, candidateApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Job {
    id: string;
    title: string;
    description: string;
    type: string;
    salary: string | null;
    location: string;
    requirements: string;
    createdAt: string;
    companyName: string;
    description_enterprise: string | null;
    industry: string | null;
    location_enterprise: string | null;
    companyLogoUrl: string | null;
    applicationCount: number;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CandidateJobDetailsPage({ params }: PageProps) {
    const { id: jobId } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    async function fetchJob() {
        try {
            const data = await jobsApi.getJobById(jobId);

            if (!data.job) {
                toast.error("Job not found");
                router.push("/candidate/jobs");
                return;
            }

            setJob(data.job);

            // Check if already applied
            if (isAuthenticated) {
                try {
                    const appsData = await candidateApi.getApplications();
                    const applied = appsData.applications?.some(
                        (app: any) => app.jobId === jobId || app.jobOffer?.id === jobId
                    );
                    setHasApplied(applied || false);
                } catch {
                    // Silently fail - just means we can't check
                    console.log("Could not check application status");
                }
            }
        } catch {
            toast.error("Failed to load job details");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleApply() {
        if (!isAuthenticated) {
            toast.error("Please login to apply");
            router.push("/auth/login?callbackUrl=/candidate/jobs/" + jobId);
            return;
        }

        setIsApplying(true);
        try {
            const data = await jobsApi.apply(jobId);

            if (data.success) {
                toast.success(`Application sent! Match Score: ${data.matchingScore}%`);
                setHasApplied(true);
            } else {
                toast.error("Failed to apply");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to apply");
        } finally {
            setIsApplying(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h3>
                <Link href="/candidate/jobs" className="text-blue-600 hover:underline">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    // safely parse requirements if it's a string, otherwise use it as is if it's already an array
    let requirements: string[] = [];
    try {
        requirements = typeof job.requirements === 'string'
            ? JSON.parse(job.requirements)
            : Array.isArray(job.requirements) ? job.requirements : [];
    } catch {
        requirements = [];
    }

    const postedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/candidate/jobs"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
            </Link>

            {/* Job Header Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
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
                                Posted {postedDate}
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
                <div className="mt-8">
                    {hasApplied ? (
                        <div className="flex items-center gap-3 justify-center px-8 py-4 bg-green-50 text-green-700 font-semibold rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                            You have already applied to this job
                        </div>
                    ) : (
                        <button
                            onClick={handleApply}
                            disabled={isApplying}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Apply Now
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Job Description
                </h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
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

            {/* About Company */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    About {job.companyName}
                </h2>
                <div className="space-y-4">
                    {job.industry && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <span className="font-medium">Industry:</span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{job.industry}</span>
                        </div>
                    )}
                    {job.location_enterprise && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{job.location_enterprise}</span>
                        </div>
                    )}
                    {job.description_enterprise && (
                        <p className="text-gray-600">{job.description_enterprise}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
