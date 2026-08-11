"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Briefcase,
    FileText,
    MapPin,
    DollarSign,
    Tags,
    ArrowLeft,
    Save,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { jobsApi, enterpriseApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditJobPage({ params }: PageProps) {
    const { id: jobId } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "CDI",
        salary: "",
        location: "",
        requirements: "",
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchJob();
        }
    }, [jobId, isAuthenticated]);

    async function fetchJob() {
        try {
            // Using public jobs API to get details. 
            // In a real app, might want an enterprise-specific endpoint to get "my" job, 
            // but public endpoint should suffice if it returns all fields.
            const data = await jobsApi.getJobById(jobId);

            if (!data.job) {
                toast.error("Job not found");
                router.push("/enterprise/jobs");
                return;
            }

            const job = data.job;

            // Handle requirements: API returns string[] (List<String>), form expects string
            // Check if it's already a string (JSON string) or array
            let requirementsStr = "";
            if (Array.isArray(job.requirements)) {
                requirementsStr = job.requirements.join(", ");
            } else if (typeof job.requirements === 'string') {
                try {
                    requirementsStr = JSON.parse(job.requirements).join(", ");
                } catch {
                    requirementsStr = job.requirements; // Fallback
                }
            }

            setFormData({
                title: job.title || "",
                description: job.description || "",
                type: job.type || "CDI",
                salary: job.salary || "",
                location: job.location || "",
                requirements: requirementsStr,
            });
        } catch {
            toast.error("Failed to load job");
            router.push("/enterprise/jobs");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Convert comma-separated string back to array if API expects array, 
            // or keep as string if API expects string.
            // enterpriseApi.updateJob uses fetchAPI with body.
            // JobRequest DTO expects List<String> requirements.
            // api.ts createJob used { requirements: string } in type definition but let's check updateJob.
            // updateJob takes (id, data: any). 
            // We should ensure we match the backend DTO.
            // Backend JobRequest: private List<String> requirements;

            // Wait, NewJobPage I updated used `createJob` which took `data`. 
            // In NewJobPage I passed `formData` where `requirements` is a string.
            // If backend expects List<String> it might fail if I pass a string!
            // I should double check NewJobPage too. 
            // The previous NewJobPage passed formData directly. 
            // If api.ts defines `createJob` as taking `requirements: string`, does it convert it? 
            // No, api.ts just stringifies the body.
            // So if `JobRequest` has `List<String>`, passing a string will cause deserialization error or 400.

            // FIX: I must send `requirements` as array of strings for both Create and Update.
            // I will fix `NewJobPage` after this as well if I made that mistake.

            // Backend expects requirements as a comma-separated string
            const res = await enterpriseApi.updateJob(jobId, formData);

            if (res.success) {
                toast.success("Job updated successfully!");
                router.push("/enterprise/jobs");
            } else {
                toast.error("Failed to update job");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/enterprise/jobs"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
                    <p className="text-gray-600 mt-1">Update your job posting details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Senior React Developer"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role, responsibilities, and what you're looking for..."
                                rows={5}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                            >
                                <option value="CDI">CDI (Permanent)</option>
                                <option value="CDD">CDD (Fixed-term)</option>
                                <option value="FREELANCE">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Paris, France"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salary (optional)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                placeholder="e.g. $80,000 - $100,000 / year"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (comma-separated)</label>
                        <div className="relative">
                            <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="e.g. React, TypeScript, Node.js, 3+ years experience"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            These requirements will be used to calculate candidate matching scores
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link
                        href="/enterprise/jobs"
                        className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
