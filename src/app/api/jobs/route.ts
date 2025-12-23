import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type");
        const location = searchParams.get("location");

        const session = await getServerSession(authOptions);

        // Get candidate's applications to mark jobs they've applied to
        let appliedJobIds: string[] = [];
        if (session && session.user.role === "CANDIDATE") {
            const candidate = await db.candidateProfile.findUnique({
                where: { userId: session.user.id },
                include: { applications: { select: { jobOfferId: true } } },
            });
            if (candidate) {
                appliedJobIds = candidate.applications.map((a) => a.jobOfferId);
            }
        }

        const jobs = await db.jobOffer.findMany({
            where: {
                status: "ACTIVE",
                ...(type && type !== "all" ? { type: type as "CDI" | "CDD" | "FREELANCE" } : {}),
                ...(location ? { location: { contains: location } } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search } },
                            { description: { contains: search } },
                        ],
                    }
                    : {}),
            },
            include: {
                enterprise: {
                    select: {
                        companyName: true,
                        logoUrl: true,
                    },
                },
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const jobsWithApplied = jobs.map((job) => ({
            ...job,
            hasApplied: appliedJobIds.includes(job.id),
        }));

        return NextResponse.json({ jobs: jobsWithApplied });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: [], error: "Failed to fetch jobs" }, { status: 500 });
    }
}
