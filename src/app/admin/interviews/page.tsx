"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Calendar,
    User,
    Building2,
    Briefcase,
    Search,
    Loader2,
    Trash2,
    CheckCircle,
    XCircle,
    ExternalLink,
    Video,
    Edit2,
    X
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Interview {
    id: string;
    date: string;
    meetingLink: string;
    status: string;
    application: {
        id: string;
        status: string;
        matchingScore: number;
        candidate: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            user: {
                email: string;
                photoUrl: string | null;
            };
        };
        jobOffer: {
            id: string;
            title: string;
            enterprise: {
                id: string;
                companyName: string;
                user: {
                    email: string;
                };
            };
        };
    };
}

export default function AdminInterviewsPage() {
    const { isAuthenticated } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editModal, setEditModal] = useState<Interview | null>(null);
    const [editData, setEditData] = useState({ date: "", meetingLink: "" });

    useEffect(() => {
        if (isAuthenticated) {
            fetchInterviews();
        }
    }, [isAuthenticated]);

    async function fetchInterviews() {
        try {
            const data = await adminApi.getInterviews();
            setInterviews(data.interviews || []);
        } catch {
            toast.error("Failed to load interviews");
        } finally {
            setIsLoading(false);
        }
    }

    async function updateInterviewStatus(interviewId: string, status: string) {
        setActionLoading(interviewId);
        try {
            const res = await adminApi.updateInterviewStatus(interviewId, status);

            if (res.success) {
                setInterviews(interviews.map(interview =>
                    interview.id === interviewId ? { ...interview, status } : interview
                ));
                toast.success(`Interview ${status.toLowerCase()}`);
            } else {
                toast.error("Failed to update interview");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function updateInterview() {
        if (!editModal) return;

        setActionLoading(editModal.id);
        try {
            const res = await adminApi.updateInterview(editModal.id, new Date(editData.date).toISOString(), editData.meetingLink);

            if (res.success) {
                setInterviews(interviews.map(interview =>
                    interview.id === editModal.id
                        ? { ...interview, date: new Date(editData.date).toISOString(), meetingLink: editData.meetingLink }
                        : interview
                ));
                toast.success("Interview updated successfully");
                setEditModal(null);
            } else {
                toast.error("Failed to update interview");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteInterview(interviewId: string) {
        if (!confirm("Are you sure you want to delete this interview?")) {
            return;
        }

        setActionLoading(interviewId);
        try {
            const res = await adminApi.deleteInterview(interviewId);

            if (res.success) {
                setInterviews(interviews.filter(interview => interview.id !== interviewId));
                toast.success("Interview deleted successfully");
            } else {
                toast.error("Failed to delete interview");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    function getCandidateName(candidate: Interview["application"]["candidate"] | undefined) {
        if (!candidate) return "Unknown";
        if (candidate.firstName || candidate.lastName) {
            return [candidate.firstName, candidate.lastName].filter(Boolean).join(" ");
        }
        return candidate.user?.email || "Unknown";
    }

    function openEditModal(interview: Interview) {
        setEditData({
            date: new Date(interview.date).toISOString().slice(0, 16),
            meetingLink: interview.meetingLink
        });
        setEditModal(interview);
    }

    const filteredInterviews = interviews.filter(interview => {
        // Skip interviews with missing application data
        if (!interview.application || !interview.application.candidate || !interview.application.jobOffer) {
            return false;
        }
        const candidateName = getCandidateName(interview.application.candidate);
        const matchesSearch =
            candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (interview.application.candidate.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.application.jobOffer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (interview.application.jobOffer.enterprise?.companyName || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Sort by date
    const sortedInterviews = [...filteredInterviews].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get upcoming interviews
    const now = new Date();
    const upcomingInterviews = sortedInterviews.filter(i => new Date(i.date) > now && i.status === "SCHEDULED");

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
                <h1 className="text-3xl font-bold text-gray-900">Interviews Management</h1>
                <p className="text-gray-600 mt-1">View and manage all scheduled interviews</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{interviews.length}</div>
                    <div className="text-sm text-gray-500">Total Interviews</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{upcomingInterviews.length}</div>
                    <div className="text-sm text-gray-500">Upcoming</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {interviews.filter(i => i.status === "COMPLETED").length}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                        {interviews.filter(i => i.status === "CANCELLED").length}
                    </div>
                    <div className="text-sm text-gray-500">Cancelled</div>
                </div>
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
                            placeholder="Search by candidate, job, or company..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Interviews Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date & Time</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Candidate</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Job / Company</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Meeting</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedInterviews.map((interview) => {
                                const interviewDate = new Date(interview.date);
                                const isPast = interviewDate < now;
                                return (
                                    <tr key={interview.id} className={`hover:bg-gray-50 ${isPast && interview.status === "SCHEDULED" ? "bg-yellow-50" : ""}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPast ? "bg-gray-100" : "bg-purple-100"
                                                    }`}>
                                                    <Calendar className={`w-5 h-5 ${isPast ? "text-gray-500" : "text-purple-600"}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {interviewDate.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {interviewDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {interview.application.candidate.user.photoUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={interview.application.candidate.user.photoUrl}
                                                        alt="Candidate"
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {getCandidateName(interview.application.candidate)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {interview.application.candidate.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {interview.application.jobOffer.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {interview.application.jobOffer.enterprise.companyName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${interview.status === "SCHEDULED" ? "bg-purple-100 text-purple-700" :
                                                interview.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {interview.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={interview.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span className="text-sm">Join</span>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(interview)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                {interview.status === "SCHEDULED" && (
                                                    <>
                                                        <button
                                                            onClick={() => updateInterviewStatus(interview.id, "COMPLETED")}
                                                            disabled={actionLoading === interview.id}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Mark Completed"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateInterviewStatus(interview.id, "CANCELLED")}
                                                            disabled={actionLoading === interview.id}
                                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => deleteInterview(interview.id)}
                                                    disabled={actionLoading === interview.id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    {actionLoading === interview.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {sortedInterviews.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No interviews found</p>
                    </div>
                )}
            </div>

            {/* Edit Interview Modal */}
            {editModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setEditModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Interview</h3>
                                <button
                                    onClick={() => setEditModal(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editData.date}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meeting Link
                                    </label>
                                    <input
                                        type="url"
                                        value={editData.meetingLink}
                                        onChange={(e) => setEditData({ ...editData, meetingLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setEditModal(null)}
                                        className="flex-1 px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={updateInterview}
                                        disabled={actionLoading === editModal.id}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === editModal.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
