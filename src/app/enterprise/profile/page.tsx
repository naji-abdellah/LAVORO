"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Mail, MapPin, Globe, Save, Loader2 } from "lucide-react";
import { LogoUpload } from "@/components/logo-upload";
import { enterpriseApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function EnterpriseProfilePage() {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        companyName: "",
        description: "",
        industry: "",
        location: "",
    });

    useEffect(() => {
        async function fetchData() {
            if (!isAuthenticated) return;

            try {
                // Fetch profile data from Jakarta EE API
                const data = await enterpriseApi.getProfile();
                if (data.profile) {
                    setFormData({
                        companyName: data.profile.companyName || "",
                        description: data.profile.description || "",
                        industry: data.profile.industry || "",
                        location: data.profile.location || "",
                    });
                    setCurrentLogoUrl(data.profile.logoUrl || null);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsFetching(false);
            }
        }
        fetchData();
    }, [isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await enterpriseApi.updateProfile({
                ...formData,
                logoUrl: currentLogoUrl
            });

            if (result.success) {
                toast.success("Company profile updated successfully!");
                refreshUser(); // Update company name across the app
            } else {
                toast.error("Failed to update profile");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoChange = async (url: string | null) => {
        setCurrentLogoUrl(url);
        // Also save logo URL to backend immediately
        try {
            await enterpriseApi.updateProfile({ logoUrl: url || "" });
            toast.success("Logo updated!");
            refreshUser(); // Update logo across the app
        } catch {
            console.error("Failed to save logo");
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-600 mt-1">Manage your company information</p>
            </div>

            {/* Logo Upload Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Company Logo</h2>
                <LogoUpload
                    currentLogoUrl={currentLogoUrl}
                    onLogoChange={handleLogoChange}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Acme Inc."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell candidates about your company..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-none"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        placeholder="Technology"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="New York, USA"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
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
