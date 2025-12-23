import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateMatchingScore } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Only candidates can apply to jobs" }, { status: 401 });
        }

        const { jobId } = await request.json();

        const candidate = await db.candidateProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!candidate) {
            return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
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
            return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 });
        }

        // Get job for matching score
        const job = await db.jobOffer.findUnique({
            where: { id: jobId },
            include: {
                enterprise: {
                    include: { user: true },
                },
            },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
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

        // Create notification for enterprise
        await db.notification.create({
            data: {
                userId: job.enterprise.userId,
                content: `New application received for "${job.title}" with ${matchingScore}% match!`,
            },
        });

        return NextResponse.json({ success: true, matchingScore });
    } catch (error) {
        console.error("Error applying to job:", error);
        return NextResponse.json({ error: "Failed to apply to job" }, { status: 500 });
    }
}
