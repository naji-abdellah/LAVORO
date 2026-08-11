"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Briefcase,
    MapPin,
    Building2,
    Search,
    Filter,
    ArrowRight,
    Clock,
    Loader2,
    CheckCircle,
    Users
} from "lucide-react";
import { jobsApi } from "@/lib/api";

interface Job {
    id: string;
    title: string;
    description: string;
    type: string;
    salary: string | null;
    location: string;
    status: string;
    requirements: string;
    createdAt: string;
    companyName: string;
    companyLogoUrl: string | null;
    applicationCount: number;
    hasApplied?: boolean;
}

export default function CandidateJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        type: "all",
        location: "",
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    async function fetchJobs() {
        try {
            setIsLoading(true);
            const result = await jobsApi.getJobs({
                search: filters.search || undefined,
                type: filters.type !== "all" ? filters.type : undefined,
                location: filters.location || undefined,
            });
            setJobs(result.jobs || []);
        } catch (err: any) {
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
                <p className="text-gray-600 mt-1">Find and apply to your dream job</p>
            </div>

            {/* Search & Filters */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Job title, keywords..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            placeholder="Location"
                            className="w-full md:w-48 pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="FREELANCE">Freelance</option>
                    </select>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Search
                    </button>
                </div>
            </form>

            {/* Jobs List */}
            <div className="space-y-4">
                <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{jobs.length}</span> jobs found
                </p>

                {jobs.length > 0 ? (
                    <div className="grid gap-4">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {job.companyLogoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={job.companyLogoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {job.title}
                                            </h3>
                                            <p className="text-gray-600">{job.companyName}</p>
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
                                                {job.salary && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {job.salary}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <Users className="w-4 h-4" />
                                                    {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {job.hasApplied && (
                                            <span className="flex items-center gap-2 text-green-600 font-medium px-4 py-2 bg-green-50 rounded-xl">
                                                <CheckCircle className="w-5 h-5" />
                                                Applied
                                            </span>
                                        )}
                                        <Link
                                            href={`/candidate/jobs/${job.id}`}
                                            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
