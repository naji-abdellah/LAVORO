"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    User,
    FileText,
    Calendar,
    ExternalLink,
    CheckCircle,
    XCircle,
    Loader2,
    UserX,
} from "lucide-react";
import { enterpriseApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { formatDate } from "@/lib/utils"; // Ensure this is client-safe

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
    // isAnonymous: boolean; // Backend might not have this field yet, checking...
    // If backend doesn't support anonymous, we assume false.
    createdAt: string;
    candidateEmail?: string;
    candidateName?: string;
    jobTitle: string;
    // We might need to map from whatever the API returns.
    // Based on EnterpriseResource.java (if available in context), we could know.
    // Assuming the DTO has these.
    // Let's deduce from previous page.tsx used.

    // Previous code structure:
    candidate: {
        skills: string; // or array
        user: {
            email: string;
            photoUrl: string | null;
        };
        firstName?: string;
        lastName?: string;
        cvUrl?: string;
    };
    jobOffer: {
        title: string;
    };
    interview?: {
        date: string;
        meetingLink?: string;
    };
}

export default function EnterpriseApplicationsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [applications, setApplications] = useState<any[]>([]); // Using any[] to be safe with DTO mapping
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showInterviewModal, setShowInterviewModal] = useState<string | null>(null);
    const [interviewData, setInterviewData] = useState({ date: "", meetingLink: "" });

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchApplications();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated]);

    async function fetchApplications() {
        try {
            const result = await enterpriseApi.getApplications();
            setApplications(result.applications || []);
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAction(applicationId: string, action: "ACCEPTED" | "REJECTED") {
        setActionLoading(applicationId);
        try {
            const res = await enterpriseApi.updateApplicationStatus(applicationId, action);

            if (res.success) {
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, status: action } : app
                ));
                toast.success(`Application ${action.toLowerCase()}`);
            } else {
                toast.error("Failed to update application");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleScheduleInterview(applicationId: string) {
        if (!interviewData.date || !interviewData.meetingLink) {
            toast.error("Please fill in all fields");
            return;
        }

        setActionLoading(applicationId);
        try {
            // Ensure date is in proper ISO format if needed
            // The input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
            // The backend likely expects ISO string or similar.
            const isoDate = new Date(interviewData.date).toISOString();

            const res = await enterpriseApi.scheduleInterview(applicationId, isoDate, interviewData.meetingLink);

            if (res.success) {
                toast.success("Interview scheduled successfully!");
                setShowInterviewModal(null);
                setInterviewData({ date: "", meetingLink: "" });
                fetchApplications();
            } else {
                toast.error("Failed to schedule interview");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    }

    // Helper to extract candidate name/email safely from current API structure
    // Note: ApplicationResponse has flat fields: candidateEmail, candidateFirstName, candidateLastName, candidatePhotoUrl, candidateCvUrl, candidateSkills
    function getCandidateDisplayInfo(app: any) {
        const email = app.candidateEmail || "Unknown";
        const firstName = app.candidateFirstName || "";
        const lastName = app.candidateLastName || "";
        const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email;
        const photoUrl = app.candidatePhotoUrl || null;
        const cvUrl = app.candidateCvUrl || null;
        const skills = app.candidateSkills || "";

        return { name, email, photoUrl, cvUrl, skills };
    }

    if (authLoading || isLoading) {
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
                <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                <p className="text-gray-600 mt-1">Review candidates and manage applications</p>
            </div>

            {applications.length > 0 ? (
                <div className="grid gap-4">
                    {applications.map((application) => {
                        const candidateInfo = getCandidateDisplayInfo(application);
                        const jobTitle = application.jobTitle || application.jobOffer?.title || "Unknown Job";

                        return (
                            <div
                                key={application.id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Candidate Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            {/* Candidate Photo */}
                                            {candidateInfo.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={candidateInfo.photoUrl}
                                                    alt="Candidate"
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-7 h-7 text-blue-600" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {candidateInfo.name}
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    {candidateInfo.email}
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">For: {jobTitle}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                        {application.status ? application.status.replace("_", " ") : "PENDING"}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Applied {formatDate(new Date(application.createdAt))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {candidateInfo.skills && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mb-2">Skills:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Handle if skills is string or array */}
                                                    {(typeof candidateInfo.skills === 'string'
                                                        ? JSON.parse(candidateInfo.skills)
                                                        : Array.isArray(candidateInfo.skills) ? candidateInfo.skills : []
                                                    ).map((skill: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Interview Info */}
                                        {application.interview && (
                                            <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                                                <div className="flex items-center gap-2 text-purple-700">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Interview: {formatDate(new Date(application.interview.date))}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Match Score & Actions */}
                                    <div className="flex flex-col items-end gap-4">
                                        {/* Match Score */}
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                                            <div className="text-3xl font-bold text-blue-600">{application.matchingScore}%</div>
                                            <div className="text-sm text-gray-600">Match</div>
                                        </div>

                                        {/* CV Link */}
                                        {candidateInfo.cvUrl && (
                                            <a
                                                href={candidateInfo.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View CV
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}

                                        {/* Actions */}
                                        {application.status === "PENDING" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowInterviewModal(application.id)}
                                                    className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Schedule
                                                </button>
                                                <button
                                                    onClick={() => handleAction(application.id, "ACCEPTED")}
                                                    disabled={actionLoading === application.id}
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(application.id, "REJECTED")}
                                                    disabled={actionLoading === application.id}
                                                    className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal rendering logic repeated for each item? No, keep it once */}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600">Applications for your job postings will appear here</p>
                </div>
            )}

            {/* Interview Modal (Global) */}
            {showInterviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInterviewModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Interview</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={interviewData.date}
                                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
                                <input
                                    type="url"
                                    value={interviewData.meetingLink}
                                    onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowInterviewModal(null)}
                                    className="flex-1 px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleScheduleInterview(showInterviewModal)}
                                    disabled={actionLoading === showInterviewModal}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === showInterviewModal ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5" />
                                            Schedule
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
