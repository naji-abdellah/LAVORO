"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./auth";

export async function getApplications(role: "candidate" | "enterprise", jobId?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { applications: [], error: "Unauthorized" };
        }

        if (role === "candidate") {
            const candidate = await db.candidateProfile.findUnique({
                where: { userId: session.user.id },
            });

            if (!candidate) {
                return { applications: [], error: "Candidate not found" };
            }

            const applications = await db.application.findMany({
                where: { candidateId: candidate.id },
                include: {
                    jobOffer: {
                        include: {
                            enterprise: true,
                        },
                    },
                    interview: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return { applications };
        } else {
            const enterprise = await db.enterpriseProfile.findUnique({
                where: { userId: session.user.id },
            });

            if (!enterprise) {
                return { applications: [], error: "Enterprise not found" };
            }

            const applications = await db.application.findMany({
                where: {
                    jobOffer: {
                        enterpriseId: enterprise.id,
                        ...(jobId ? { id: jobId } : {}),
                    },
                },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: { email: true },
                            },
                        },
                    },
                    jobOffer: true,
                    interview: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return { applications };
        }
    } catch (error) {
        console.error("Error fetching applications:", error);
        return { applications: [], error: "Failed to fetch applications" };
    }
}

export async function updateApplicationStatus(
    applicationId: string,
    status: "ACCEPTED" | "REJECTED"
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return { error: "Unauthorized" };
        }

        const application = await db.application.update({
            where: { id: applicationId },
            data: { status },
            include: {
                candidate: {
                    include: { user: true },
                },
                jobOffer: true,
            },
        });

        // Notify candidate
        const statusText = status === "ACCEPTED" ? "accepted" : "rejected";
        await createNotification(
            application.candidate.userId,
            `Your application for "${application.jobOffer.title}" has been ${statusText}.`
        );

        revalidatePath("/enterprise/applications");
        revalidatePath("/candidate/applications");

        return { success: true };
    } catch (error) {
        console.error("Error updating application status:", error);
        return { error: "Failed to update application" };
    }
}

export async function scheduleInterview(
    applicationId: string,
    date: string,
    meetingLink: string
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return { error: "Unauthorized" };
        }

        // Check if interview already exists
        const existingInterview = await db.interview.findUnique({
            where: { applicationId },
        });

        if (existingInterview) {
            // Update existing interview
            await db.interview.update({
                where: { applicationId },
                data: {
                    date: new Date(date),
                    meetingLink,
                    status: "SCHEDULED",
                },
            });
        } else {
            // Create new interview
            await db.interview.create({
                data: {
                    applicationId,
                    date: new Date(date),
                    meetingLink,
                },
            });
        }

        // Update application status
        const application = await db.application.update({
            where: { id: applicationId },
            data: { status: "INTERVIEW_SCHEDULED" },
            include: {
                candidate: {
                    include: { user: true },
                },
                jobOffer: true,
            },
        });

        // Notify candidate
        await createNotification(
            application.candidate.userId,
            `Interview scheduled for "${application.jobOffer.title}"! Check your applications for details.`
        );

        revalidatePath("/enterprise/applications");
        revalidatePath("/candidate/applications");

        return { success: true };
    } catch (error) {
        console.error("Error scheduling interview:", error);
        return { error: "Failed to schedule interview" };
    }
}

export async function getCandidateDashboardStats() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return null;
        }

        const candidate = await db.candidateProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!candidate) return null;

        const [totalApplications, pendingApplications, interviews, acceptedApplications] = await Promise.all([
            db.application.count({ where: { candidateId: candidate.id } }),
            db.application.count({ where: { candidateId: candidate.id, status: "PENDING" } }),
            db.application.count({ where: { candidateId: candidate.id, status: "INTERVIEW_SCHEDULED" } }),
            db.application.count({ where: { candidateId: candidate.id, status: "ACCEPTED" } }),
        ]);

        const upcomingInterviews = await db.interview.findMany({
            where: {
                application: { candidateId: candidate.id },
                date: { gte: new Date() },
                status: "SCHEDULED",
            },
            include: {
                application: {
                    include: {
                        jobOffer: {
                            include: { enterprise: true },
                        },
                    },
                },
            },
            orderBy: { date: "asc" },
            take: 5,
        });

        return {
            totalApplications,
            pendingApplications,
            interviews,
            acceptedApplications,
            upcomingInterviews,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return null;
    }
}

export async function getEnterpriseDashboardStats() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return null;
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) return null;

        const [activeJobs, totalApplications, pendingApplications, scheduledInterviews] = await Promise.all([
            db.jobOffer.count({ where: { enterpriseId: enterprise.id, status: "ACTIVE" } }),
            db.application.count({ where: { jobOffer: { enterpriseId: enterprise.id } } }),
            db.application.count({ where: { jobOffer: { enterpriseId: enterprise.id }, status: "PENDING" } }),
            db.application.count({ where: { jobOffer: { enterpriseId: enterprise.id }, status: "INTERVIEW_SCHEDULED" } }),
        ]);

        const recentApplications = await db.application.findMany({
            where: { jobOffer: { enterpriseId: enterprise.id } },
            include: {
                candidate: {
                    include: { user: { select: { email: true } } },
                },
                jobOffer: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        return {
            activeJobs,
            totalApplications,
            pendingApplications,
            scheduledInterviews,
            recentApplications,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return null;
    }
}
