"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Users,
    Building2,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Loader2,
    Shield,
    User,
    Eye,
    X,
    Mail,
    Phone,
    MapPin,
    FileText,
    Briefcase,
    Calendar,
    ExternalLink,
    Tags,
    AlertTriangle
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

// Define safe types matching backend DTOs roughly or handling flexibility
interface UserData {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    photoUrl: string | null;
    // Flat fields from UserResponse
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    logoUrl?: string | null;
}

interface UserDetails {
    user: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        photoUrl: string | null;
        createdAt: string;
    };
    profile: {
        type: "candidate" | "enterprise";
        firstName?: string | null;
        lastName?: string | null;
        bio?: string | null;
        phone?: string | null;
        address?: string | null;
        skills?: string[];
        cvUrl?: string | null;
        companyName?: string;
        description?: string | null;
        industry?: string | null;
        location?: string | null;
        logoUrl?: string | null;
    } | null;
    stats: {
        applicationCount: number;
        jobCount: number;
    };
}

export default function AdminUsersPage() {
    const { isAuthenticated } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Deactivation modal state
    const [deactivateModal, setDeactivateModal] = useState<{ userId: string; email: string } | null>(null);
    const [deactivationReason, setDeactivationReason] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    async function fetchUsers() {
        try {
            const data = await adminApi.getUsers();
            setUsers(data.users || []);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }

    async function viewUserDetails(userId: string) {
        setDetailsLoading(true);
        try {
            const data = await adminApi.getUserById(userId);
            if (data) {
                // Parse skills - could be JSON array, comma-separated string, or array
                let parsedSkills: string[] = [];
                if (data.profile?.skills) {
                    if (Array.isArray(data.profile.skills)) {
                        parsedSkills = data.profile.skills;
                    } else if (typeof data.profile.skills === 'string') {
                        // Try JSON parse first, fall back to comma-separated
                        try {
                            parsedSkills = JSON.parse(data.profile.skills);
                        } catch {
                            // It's a comma-separated string
                            parsedSkills = data.profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                    }
                }

                const userDetails: UserDetails = {
                    user: data.user,
                    profile: data.profile ? {
                        ...data.profile,
                        skills: parsedSkills
                    } : null,
                    stats: data.stats || { applicationCount: 0, jobCount: 0 }
                };
                setSelectedUser(userDetails);
            } else {
                toast.error("Failed to load user details");
            }
        } catch (err) {
            console.error("Error loading user details:", err);
            toast.error("An error occurred");
        } finally {
            setDetailsLoading(false);
        }
    }

    async function handleDeactivateUser() {
        if (!deactivateModal) return;

        if (!deactivationReason.trim()) {
            toast.error("Please provide a reason for deactivation");
            return;
        }

        setActionLoading(deactivateModal.userId);
        try {
            const res = await adminApi.updateUserStatus(deactivateModal.userId, false, deactivationReason.trim());

            if (res.success) {
                setUsers(users.map(user =>
                    user.id === deactivateModal.userId ? { ...user, isActive: false } : user
                ));
                toast.success("User deactivated successfully");
                setDeactivateModal(null);
                setDeactivationReason("");
            } else {
                toast.error("Failed to deactivate user");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function activateUser(userId: string) {
        setActionLoading(userId);
        try {
            const res = await adminApi.updateUserStatus(userId, true);

            if (res.success) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, isActive: true } : user
                ));
                toast.success("User activated successfully");
            } else {
                toast.error("Failed to activate user");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        setActionLoading(userId);
        try {
            const res = await adminApi.deleteUser(userId);

            if (res.success) {
                setUsers(users.filter(user => user.id !== userId));
                toast.success("User deleted successfully");
            } else {
                toast.error("Failed to delete user");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    function getDisplayName(user: UserData) {
        if (user.role === "CANDIDATE" && (user.firstName || user.lastName)) {
            return [user.firstName, user.lastName].filter(Boolean).join(" ");
        }
        if (user.role === "ENTERPRISE" && user.companyName) {
            return user.companyName;
        }
        return user.email;
    }

    function getUserImage(user: UserData) {
        if (user.role === "ENTERPRISE" && user.logoUrl) {
            return user.logoUrl;
        }
        return user.photoUrl;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage candidates and enterprises</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 bg-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="CANDIDATE">Candidates</option>
                        <option value="ENTERPRISE">Enterprises</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">User</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Joined</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => {
                                const imageUrl = getUserImage(user);
                                const displayName = getDisplayName(user);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={imageUrl}
                                                        alt={user.role === "ENTERPRISE" ? "Company logo" : "Profile"}
                                                        className={`w-10 h-10 object-cover border-2 border-white shadow-sm ${user.role === "ENTERPRISE" ? "rounded-lg" : "rounded-full"
                                                            }`}
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 flex items-center justify-center ${user.role === "CANDIDATE" ? "bg-green-100 rounded-full" :
                                                        user.role === "ENTERPRISE" ? "bg-purple-100 rounded-lg" :
                                                            "bg-blue-100 rounded-full"
                                                        }`}>
                                                        {user.role === "CANDIDATE" ? (
                                                            <User className="w-5 h-5 text-green-600" />
                                                        ) : user.role === "ENTERPRISE" ? (
                                                            <Building2 className="w-5 h-5 text-purple-600" />
                                                        ) : (
                                                            <Shield className="w-5 h-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{displayName}</p>
                                                    {displayName !== user.email && (
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "CANDIDATE" ? "bg-green-100 text-green-700" :
                                                user.role === "ENTERPRISE" ? "bg-purple-100 text-purple-700" :
                                                    "bg-blue-100 text-blue-700"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Details Button */}
                                                {user.role !== "ADMIN" && (
                                                    <button
                                                        onClick={() => viewUserDetails(user.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {user.role !== "ADMIN" && (
                                                    <>
                                                        {user.isActive ? (
                                                            <button
                                                                onClick={() => setDeactivateModal({ userId: user.id, email: user.email })}
                                                                disabled={actionLoading === user.id}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Deactivate user"
                                                            >
                                                                {actionLoading === user.id ? (
                                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <ToggleRight className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => activateUser(user.id)}
                                                                disabled={actionLoading === user.id}
                                                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                                                                title="Activate user"
                                                            >
                                                                {actionLoading === user.id ? (
                                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <ToggleLeft className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}
            </div>

            {/* Deactivation Reason Modal */}
            {deactivateModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setDeactivateModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Deactivate Account</h3>
                                    <p className="text-sm text-gray-500">{deactivateModal.email}</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Please provide a reason for deactivating this account. This message will be shown to the user when they try to log in.
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deactivation Reason *
                                </label>
                                <textarea
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    placeholder="e.g., Violation of terms of service, Suspicious activity, etc."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeactivateModal(null);
                                        setDeactivationReason("");
                                    }}
                                    className="flex-1 px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeactivateUser}
                                    disabled={actionLoading === deactivateModal.userId || !deactivationReason.trim()}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === deactivateModal.userId ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-5 h-5" />
                                            Deactivate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal - (same as before but dynamic data) */}
            {(selectedUser || detailsLoading) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => !detailsLoading && setSelectedUser(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : selectedUser && (
                            <>
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        {selectedUser.user.photoUrl || (selectedUser.profile?.type === "enterprise" && selectedUser.profile?.logoUrl) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selectedUser.profile?.logoUrl || selectedUser.user.photoUrl || ""}
                                                alt="Profile"
                                                className={`w-20 h-20 object-cover border-4 border-white shadow-lg ${selectedUser.user.role === "ENTERPRISE" ? "rounded-xl" : "rounded-full"}`}
                                            />
                                        ) : (
                                            <div className={`w-20 h-20 flex items-center justify-center ${selectedUser.user.role === "CANDIDATE" ? "bg-green-100 rounded-full" : "bg-purple-100 rounded-xl"}`}>
                                                {selectedUser.user.role === "CANDIDATE" ? <User className="w-10 h-10 text-green-600" /> : <Building2 className="w-10 h-10 text-purple-600" />}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {selectedUser.profile?.type === "candidate"
                                                    ? [selectedUser.profile.firstName, selectedUser.profile.lastName].filter(Boolean).join(" ") || selectedUser.user.email
                                                    : selectedUser.profile?.companyName || selectedUser.user.email
                                                }
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.user.role === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                                                    {selectedUser.user.role}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {selectedUser.user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <h4 className="font-semibold text-gray-900">Contact Information</h4>
                                        <div className="grid gap-3">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{selectedUser.user.email}</span>
                                            </div>
                                            {selectedUser.profile?.phone && (
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{selectedUser.profile.phone}</span>
                                                </div>
                                            )}
                                            {(selectedUser.profile?.address || selectedUser.profile?.location) && (
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{selectedUser.profile.address || selectedUser.profile.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Joined {new Date(selectedUser.user.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Details */}
                                    {selectedUser.profile && (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <h4 className="font-semibold text-gray-900">
                                                {selectedUser.profile.type === "candidate" ? "About" : "Company Info"}
                                            </h4>
                                            {(selectedUser.profile.bio || selectedUser.profile.description) && (
                                                <p className="text-gray-600">{selectedUser.profile.bio || selectedUser.profile.description}</p>
                                            )}
                                            {selectedUser.profile.industry && (
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">Industry: {selectedUser.profile.industry}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Skills (for candidates) */}
                                    {selectedUser.profile?.skills && (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Tags className="w-4 h-4" />
                                                Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(selectedUser.profile.skills)
                                                    ? selectedUser.profile.skills
                                                    : JSON.parse(selectedUser.profile.skills as string || "[]")
                                                ).map((skill: string, index: number) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CV Link (for candidates) */}
                                    {selectedUser.profile?.cvUrl && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4" />
                                                Resume/CV
                                            </h4>
                                            <a
                                                href={selectedUser.profile.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View CV
                                            </a>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedUser.stats.applicationCount > 0 && (
                                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-bold text-blue-600">{selectedUser.stats.applicationCount}</div>
                                                <div className="text-sm text-gray-600">Applications</div>
                                            </div>
                                        )}
                                        {selectedUser.stats.jobCount > 0 && (
                                            <div className="bg-purple-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-bold text-purple-600">{selectedUser.stats.jobCount}</div>
                                                <div className="text-sm text-gray-600">Job Posts</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
