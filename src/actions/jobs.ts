"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchingScore } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { createNotification } from "./auth";

export async function getJobs(filters?: {
    type?: string;
    location?: string;
    search?: string;
    status?: string;
}) {
    try {
        const jobs = await db.jobOffer.findMany({
            where: {
                status: filters?.status === "all" ? undefined : "ACTIVE",
                ...(filters?.type && filters.type !== "all" ? { type: filters.type as "CDI" | "CDD" | "FREELANCE" } : {}),
                ...(filters?.location ? { location: { contains: filters.location } } : {}),
                ...(filters?.search
                    ? {
                        OR: [
                            { title: { contains: filters.search } },
                            { description: { contains: filters.search } },
                        ],
                    }
                    : {}),
            },
            include: {
                enterprise: {
                    include: {
                        user: {
                            select: { email: true },
                        },
                    },
                },
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { jobs };
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return { jobs: [], error: "Failed to fetch jobs" };
    }
}

export async function getJobById(jobId: string) {
    try {
        const job = await db.jobOffer.findUnique({
            where: { id: jobId },
            include: {
                enterprise: true,
                _count: {
                    select: { applications: true },
                },
            },
        });

        return { job };
    } catch (error) {
        console.error("Error fetching job:", error);
        return { job: null, error: "Failed to fetch job" };
    }
}

export async function createJob(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return { error: "Unauthorized" };
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) {
            return { error: "Enterprise profile not found" };
        }

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const type = formData.get("type") as "CDI" | "CDD" | "FREELANCE";
        const salary = formData.get("salary") as string;
        const location = formData.get("location") as string;
        const requirements = formData.get("requirements") as string;

        // Convert comma-separated requirements to JSON array
        const reqArray = requirements
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r);

        const job = await db.jobOffer.create({
            data: {
                enterpriseId: enterprise.id,
                title,
                description,
                type,
                salary,
                location,
                requirements: JSON.stringify(reqArray),
            },
        });

        revalidatePath("/enterprise/jobs");
        revalidatePath("/jobs");
        revalidatePath("/");

        return { success: true, jobId: job.id };
    } catch (error) {
        console.error("Error creating job:", error);
        return { error: "Failed to create job" };
    }
}

export async function updateJob(jobId: string, formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return { error: "Unauthorized" };
        }

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const type = formData.get("type") as "CDI" | "CDD" | "FREELANCE";
        const salary = formData.get("salary") as string;
        const location = formData.get("location") as string;
        const requirements = formData.get("requirements") as string;
        const status = formData.get("status") as "ACTIVE" | "CLOSED";

        const reqArray = requirements
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r);

        await db.jobOffer.update({
            where: { id: jobId },
            data: {
                title,
                description,
                type,
                salary,
                location,
                requirements: JSON.stringify(reqArray),
                status,
            },
        });

        revalidatePath("/enterprise/jobs");
        revalidatePath("/jobs");

        return { success: true };
    } catch (error) {
        console.error("Error updating job:", error);
        return { error: "Failed to update job" };
    }
}

export async function deleteJob(jobId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ENTERPRISE" && session.user.role !== "ADMIN")) {
            return { error: "Unauthorized" };
        }

        await db.jobOffer.delete({
            where: { id: jobId },
        });

        revalidatePath("/enterprise/jobs");
        revalidatePath("/admin/moderation");
        revalidatePath("/jobs");

        return { success: true };
    } catch (error) {
        console.error("Error deleting job:", error);
        return { error: "Failed to delete job" };
    }
}

export async function applyToJob(jobId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return { error: "Only candidates can apply to jobs" };
        }

        const candidate = await db.candidateProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!candidate) {
            return { error: "Candidate profile not found" };
        }

        // Check if already applied
        const existingApplication = await db.application.findUnique({
            where: {
                candidateId_jobOfferId: {
                    candidateId: candidate.id,
                    jobOfferId: jobId,
                },
            },
        });

        if (existingApplication) {
            return { error: "You have already applied to this job" };
        }

        // Get job requirements for matching score
        const job = await db.jobOffer.findUnique({
            where: { id: jobId },
            include: {
                enterprise: {
                    include: { user: true },
                },
            },
        });

        if (!job) {
            return { error: "Job not found" };
        }

        // Calculate matching score
        const candidateSkills: string[] = JSON.parse(candidate.skills || "[]");
        const jobRequirements: string[] = JSON.parse(job.requirements || "[]");
        const matchingScore = calculateMatchingScore(candidateSkills, jobRequirements);

        // Create application
        await db.application.create({
            data: {
                candidateId: candidate.id,
                jobOfferId: jobId,
                matchingScore,
            },
        });

        // Notify enterprise
        await createNotification(
            job.enterprise.userId,
            `New application received for "${job.title}" with ${matchingScore}% match!`
        );

        revalidatePath("/candidate/applications");
        revalidatePath("/enterprise/applications");

        return { success: true, matchingScore };
    } catch (error) {
        console.error("Error applying to job:", error);
        return { error: "Failed to apply to job" };
    }
}

export async function getEnterpriseJobs() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return { jobs: [], error: "Unauthorized" };
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) {
            return { jobs: [], error: "Enterprise not found" };
        }

        const jobs = await db.jobOffer.findMany({
            where: { enterpriseId: enterprise.id },
            include: {
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { jobs };
    } catch (error) {
        console.error("Error fetching enterprise jobs:", error);
        return { jobs: [], error: "Failed to fetch jobs" };
    }
}
