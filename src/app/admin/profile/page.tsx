"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Shield, Loader2 } from "lucide-react";
import { PhotoUpload } from "@/components/photo-upload";
import { useAuth } from "@/lib/AuthContext";
import { userApi } from "@/lib/api";

export default function AdminProfilePage() {
    const { user, isAuthenticated, loading } = useAuth();
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            setCurrentPhotoUrl(user.photoUrl);
        }
    }, [isAuthenticated, user]);

    // Handle photo update
    const handlePhotoChange = async (url: string | null) => {
        setCurrentPhotoUrl(url);
        // Photo upload component usually handles the upload, but if we need to sync state:
        // Already handled by PhotoUpload calling an API and returning the URL.
        // If we need to update the auth context or refetch user, that might be needed.
        // Assuming PhotoUpload does the job, we just update local state for display.
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
                <p className="text-gray-600 mt-1">Manage your administrator profile</p>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Profile Photo</h2>
                <PhotoUpload
                    currentPhotoUrl={currentPhotoUrl}
                    onPhotoChange={handlePhotoChange}
                />
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value="Administrator"
                                disabled
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> As an administrator, your profile photo will be visible in the admin dashboard and sidebar.
                </p>
            </div>
        </div>
    );
}
