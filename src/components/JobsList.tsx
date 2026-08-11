'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Briefcase, MapPin, Clock, Building2, Search, Filter, ArrowRight, Loader2 } from "lucide-react";

interface Job {
    id: string;
    title: string;
    description: string;
    type: string;
    salary: string;
    location: string;
    status: string;
    requirements: string;
    createdAt: string;
    applicationCount: number;
    companyName: string;
    companyLogoUrl: string | null;
    companyIndustry: string;
    companyLocation: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/job-recruitment-api/api';

export default function JobsList({
    initialType = '',
    initialLocation = '',
    initialSearch = ''
}: {
    initialType?: string;
    initialLocation?: string;
    initialSearch?: string;
}) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState(initialType);
    const [location, setLocation] = useState(initialLocation);
    const [search, setSearch] = useState(initialSearch);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (type && type !== 'all') params.append('type', type);
            if (location) params.append('location', location);
            if (search) params.append('search', search);

            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await fetch(`${API_BASE_URL}/jobs${query}`);

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data.jobs || []);
        } catch (err: any) {
            setError(err.message);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Job title, keywords..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location"
                            className="w-full md:w-48 pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <select
                        value={type || 'all'}
                        onChange={(e) => setType(e.target.value)}
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

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading jobs...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchJobs}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-gray-600">
                                <span className="font-semibold text-gray-900">{jobs.length}</span> jobs found
                            </p>
                        </div>

                        {jobs.length > 0 ? (
                            <div className="grid gap-6">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    {job.companyLogoUrl ? (
                                                        <img src={job.companyLogoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <Building2 className="w-7 h-7 text-blue-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-gray-600 mt-1">{job.companyName}</p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {job.location}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.type === "CDI"
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
                                                        <span className="text-gray-400">
                                                            {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 lg:flex-shrink-0">
                                                <Link
                                                    href={`/jobs/${job.id}`}
                                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                    </>
                )}
            </div>
        </>
    );
}
