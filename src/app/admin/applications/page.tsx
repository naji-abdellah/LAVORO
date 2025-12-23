"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    FileText,
    User,
    Building2,
    Briefcase,
    Calendar,
    Search,
    Loader2,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    Eye,
    X,
    EyeOff,
    UserX
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function getStatusColor(status: string) {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'REVIEWED': return 'bg-blue-100 text-blue-700';
        case 'ACCEPTED': return 'bg-green-100 text-green-700';
        case 'REJECTED': return 'bg-red-100 text-red-700';
        case 'INTERVIEW': return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

interface Application {
    id: string;
    status: string;
    matchingScore: number;
    isAnonymous?: boolean;
    createdAt: string;
    // Flat candidate fields from API
    candidateId?: string;
    candidateEmail?: string;
    candidateFirstName?: string | null;
    candidateLastName?: string | null;
    candidateBio?: string | null;
    candidateSkills?: string | null;
    candidateCvUrl?: string | null;
    candidatePhone?: string | null;
    candidatePhotoUrl?: string | null;
    // Flat job fields from API
    jobId?: string;
    jobTitle?: string;
    jobLocation?: string;
    companyName?: string;
    // Interview info
    interview?: {
        id: string;
        date: string;
        meetingLink?: string;
        status?: string;
    } | null;
}

export default function AdminApplicationsPage() {
    const { isAuthenticated } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchApplications();
        }
    }, [isAuthenticated]);

    async function fetchApplications() {
        try {
            const result = await adminApi.getApplications();
            setApplications(result.applications || []);
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setIsLoading(false);
        }
    }

    async function updateStatus(applicationId: string, status: string) {
        setActionLoading(applicationId);
        try {
            const res = await adminApi.updateApplicationStatus(applicationId, status);

            if (res.success) {
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, status } : app
                ));
                toast.success(`Application ${status.toLowerCase()}`);
            } else {
                toast.error("Failed to update application");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function toggleAnonymous(applicationId: string, currentStatus: boolean | undefined) {
        // If undefined, treat as false
        const isAnon = currentStatus || false;

        setActionLoading(applicationId);
        try {
            const res = await adminApi.toggleApplicationAnonymity(applicationId, !isAnon);

            if (res.success) {
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, isAnonymous: !isAnon } : app
                ));
                toast.success(!isAnon ? "Candidate is now anonymous to the enterprise" : "Candidate is now visible to the enterprise");

                // Also update selectedApp if open
                if (selectedApp && selectedApp.id === applicationId) {
                    setSelectedApp({ ...selectedApp, isAnonymous: !isAnon });
                }
            } else {
                toast.error("Failed to update anonymity");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteApplication(applicationId: string) {
        if (!confirm("Are you sure you want to delete this application? This will also delete any associated interview.")) {
            return;
        }

        setActionLoading(applicationId);
        try {
            const res = await adminApi.deleteApplication(applicationId);

            if (res.success) {
                setApplications(applications.filter(app => app.id !== applicationId));
                toast.success("Application deleted successfully");
                if (selectedApp && selectedApp.id === applicationId) {
                    setSelectedApp(null);
                }
            } else {
                toast.error("Failed to delete application");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    function getCandidateName(app: Application) {
        if (app.candidateFirstName || app.candidateLastName) {
            return [app.candidateFirstName, app.candidateLastName].filter(Boolean).join(" ");
        }
        return app.candidateEmail || "Unknown";
    }

    const filteredApplications = applications.filter(app => {
        const candidateName = getCandidateName(app);
        const candidateEmail = app.candidateEmail || "";
        const jobTitle = app.jobTitle || "";
        const companyName = app.companyName || "";
        const matchesSearch =
            candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
                <p className="text-gray-600 mt-1">View and manage all job applications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                        {applications.filter(a => a.status === "PENDING").length}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {applications.filter(a => a.status === "ACCEPTED").length}
                    </div>
                    <div className="text-sm text-gray-500">Accepted</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                        {applications.filter(a => a.interview).length}
                    </div>
                    <div className="text-sm text-gray-500">Interviews</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                        {applications.filter(a => a.isAnonymous).length}
                    </div>
                    <div className="text-sm text-gray-500">Anonymous</div>
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
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    </select>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Candidate</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Job / Company</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Match</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApplications.map((app) => (
                                <tr key={app.id} className={`hover:bg-gray-50 ${app.isAnonymous ? "bg-orange-50" : ""}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {app.candidatePhotoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={app.candidatePhotoUrl}
                                                    alt="Candidate"
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{getCandidateName(app)}</p>
                                                    {app.isAnonymous && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <UserX className="w-3 h-3" />
                                                            Anonymous
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{app.candidateEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{app.jobTitle}</p>
                                                <p className="text-sm text-gray-500">{app.companyName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-lg font-bold text-blue-600">{app.matchingScore}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${getStatusColor(app.status)}`}>
                                                {app.status.replace("_", " ")}
                                            </span>
                                            {app.interview && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium inline-block w-fit">
                                                    Interview Set
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(new Date(app.createdAt))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {/* Anonymity Toggle */}
                                            <button
                                                onClick={() => toggleAnonymous(app.id, app.isAnonymous)}
                                                disabled={actionLoading === app.id}
                                                className={`p-2 rounded-lg transition-colors ${app.isAnonymous
                                                    ? "text-orange-600 hover:bg-orange-50"
                                                    : "text-gray-400 hover:bg-gray-50"
                                                    }`}
                                                title={app.isAnonymous ? "Make visible to enterprise" : "Make anonymous to enterprise"}
                                            >
                                                {app.isAnonymous ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <UserX className="w-5 h-5" />
                                                )}
                                            </button>
                                            {app.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(app.id, "ACCEPTED")}
                                                        disabled={actionLoading === app.id}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Accept"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(app.id, "REJECTED")}
                                                        disabled={actionLoading === app.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => deleteApplication(app.id)}
                                                disabled={actionLoading === app.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                {actionLoading === app.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No applications found</p>
                    </div>
                )}
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                                {selectedApp.isAnonymous && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                                        <UserX className="w-3 h-3" />
                                        Anonymous
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Candidate Info */}
                            <div className="flex items-center gap-4">
                                {selectedApp.candidatePhotoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selectedApp.candidatePhotoUrl}
                                        alt="Candidate"
                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-green-600" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {getCandidateName(selectedApp)}
                                    </h3>
                                    <p className="text-gray-500">{selectedApp.candidateEmail}</p>
                                </div>
                            </div>

                            {/* Anonymous Toggle in Modal */}
                            <div className={`rounded-xl p-4 ${selectedApp.isAnonymous ? "bg-orange-50" : "bg-gray-50"}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Anonymity Status</p>
                                        <p className="text-sm text-gray-500">
                                            {selectedApp.isAnonymous
                                                ? "This candidate's info is hidden from the enterprise"
                                                : "This candidate's info is visible to the enterprise"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleAnonymous(selectedApp.id, selectedApp.isAnonymous)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedApp.isAnonymous
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        {selectedApp.isAnonymous ? (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                Make Visible
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-4 h-4" />
                                                Make Anonymous
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Job Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{selectedApp.jobTitle}</h4>
                                        <p className="text-gray-500">{selectedApp.companyName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Score */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApp.status)}`}>
                                        {selectedApp.status.replace("_", " ")}
                                    </span>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm text-blue-600 mb-1">Match Score</p>
                                    <p className="text-2xl font-bold text-blue-700">{selectedApp.matchingScore}%</p>
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedApp.candidateSkills && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            try {
                                                const skills = typeof selectedApp.candidateSkills === 'string'
                                                    ? JSON.parse(selectedApp.candidateSkills)
                                                    : [];
                                                return Array.isArray(skills) ? skills.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                )) : null;
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* CV Link */}
                            {selectedApp.candidateCvUrl && (
                                <a
                                    href={selectedApp.candidateCvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span className="font-medium">View CV</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}

                            {/* Interview Info */}
                            {selectedApp.interview && (
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                                        <Calendar className="w-5 h-5" />
                                        <span className="font-medium">Interview Scheduled</span>
                                    </div>
                                    <p className="text-purple-600">
                                        {formatDate(new Date(selectedApp.interview.date))}
                                    </p>
                                    {selectedApp.interview.meetingLink && (
                                        <a
                                            href={selectedApp.interview.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Meeting Link
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Applied Date */}
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Applied {formatDate(new Date(selectedApp.createdAt))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
