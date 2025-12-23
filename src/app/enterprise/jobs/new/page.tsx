"use client";

import { useState } from "react";
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
import { enterpriseApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function NewJobPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "CDI",
        salary: "",
        location: "",
        requirements: "",
        // Other fields might be needed like industry, etc., if backend supports it
        // Sticking to previous form fields
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) return;

        setIsLoading(true);

        try {
            // Check if API client expects specific requirements format
            // createJob signature in api.ts takes string for requirements.
            // But usually requirements are array. Let's check api.ts again? 
            // Checked api.ts: createJob takes { requirements: string; ... }
            // So we can pass formData directly if names match.

            const res = await enterpriseApi.createJob(formData);

            if (res.success) {
                toast.success("Job created successfully!");
                router.push("/enterprise/jobs");
            } else {
                toast.error("Failed to create job");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create job");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) return null; // Or loader/redirect

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
                    <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
                    <p className="text-gray-600 mt-1">Fill in the details for your job posting</p>
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
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Job
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
