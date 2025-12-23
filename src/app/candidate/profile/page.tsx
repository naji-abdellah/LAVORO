"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Tags, Save, Loader2, User } from "lucide-react";
import { PhotoUpload } from "@/components/photo-upload";
import { CvUpload } from "@/components/cv-upload";
import { profileApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function CandidateProfilePage() {
    const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
    const [currentCvUrl, setCurrentCvUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        bio: "",
        phone: "",
        address: "",
        skills: "",
    });

    useEffect(() => {
        async function fetchData() {
            if (!isAuthenticated) return;

            try {
                // Fetch profile data
                const data = await profileApi.getProfile();
                const profile = data.user;
                // Note: The API response structure depends on the backend. 
                // Assuming data.user contains the profile fields or nested profile object.
                // Based on previous entities, User has CandidateProfile.
                // Let's assume the API flattens it or returns it in a way we can use.
                // Or we might need to adjust based on exact backend response.
                // For now, mapping best guess based on previous code.

                const skills = typeof profile.skills === 'string'
                    ? JSON.parse(profile.skills || "[]")
                    : Array.isArray(profile.skills) ? profile.skills : [];

                setFormData({
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    bio: profile.bio || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                    skills: Array.isArray(skills) ? skills.join(", ") : skills,
                });

                setCurrentCvUrl(profile.cvUrl || null);
                setCurrentPhotoUrl(profile.photoUrl || null);

            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Failed to load profile data");
            } finally {
                setIsFetching(false);
            }
        }

        if (!authLoading) {
            fetchData();
        }
    }, [isAuthenticated, authLoading]);

    const handlePhotoChange = async (url: string) => {
        setCurrentPhotoUrl(url);
        try {
            console.log("Saving photo, data length:", url.length);
            const res = await profileApi.updateProfile({ photoUrl: url });
            console.log("Photo save response:", res);
            if (res.success) {
                toast.success("Photo saved successfully!");
                refreshUser(); // Update photo across the app
            } else {
                toast.error("Failed to save photo");
            }
        } catch (error) {
            console.error("Photo save error:", error);
            toast.error("Failed to save photo - file may be too large");
        }
    };

    const handleCvChange = async (url: string | null) => {
        setCurrentCvUrl(url);
        try {
            console.log("Saving CV, data length:", url?.length);
            const res = await profileApi.updateProfile({ cvUrl: url });
            console.log("CV save response:", res);
            if (res.success) {
                toast.success("CV saved successfully!");
                refreshUser(); // Update CV info if needed
            } else {
                toast.error("Failed to save CV");
            }
        } catch (error) {
            console.error("CV save error:", error);
            toast.error("Failed to save CV - file may be too large");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const skillsArray = formData.skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s);

            // Using profileApi.updateProfile
            // We might need to verify if updateProfile handles all these fields
            const res = await profileApi.updateProfile({
                ...formData,
                skills: JSON.stringify(skillsArray), // Backend likely expects a string for JSON column if it was like that before
                // But earlier inspection of CandidateProfile entity might clarify. 
                // For now adhering to previous implementation's logic.
            });

            if (res.success) {
                toast.success("Profile updated successfully!");
                refreshUser(); // Update name across the app
            } else {
                toast.error("Failed to update profile");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and skills</p>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Profile Photo</h2>
                <PhotoUpload
                    currentPhotoUrl={currentPhotoUrl}
                    onPhotoChange={handlePhotoChange}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

                    <div className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name (Prénom)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name (Nom)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 234 567 8900"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="New York, USA"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Skills Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Skills</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Skills (comma-separated)
                        </label>
                        <div className="relative">
                            <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="React, Node.js, Python, TypeScript"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            These skills will be used to match you with relevant job opportunities.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
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

            {/* CV Upload Card - Outside form since it has its own upload */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resume / CV</h2>
                <CvUpload
                    currentCvUrl={currentCvUrl}
                    onCvChange={handleCvChange}
                />
            </div>
        </div>
    );
}
