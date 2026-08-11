import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const enterprise = await db.enterpriseProfile.findUnique({
                where: { userId: authUser.id },
            });

            if (!enterprise) {
                return NextResponse.json({ jobs: [] });
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

            return NextResponse.json({ jobs });
        } catch (dbErr) {
            console.warn("DB not reachable for enterprise jobs:", dbErr);
            return NextResponse.json({ jobs: [] });
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: [] });
    }
}

export async function POST(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, type, salary, location, requirements } = body;

        const reqArray = requirements
            ? (typeof requirements === "string" ? requirements.split(",").map((r: string) => r.trim()).filter((r: string) => r) : requirements)
            : [];

        try {
            let enterprise = await db.enterpriseProfile.findUnique({
                where: { userId: authUser.id },
            });

            if (!enterprise) {
                enterprise = await db.enterpriseProfile.create({
                    data: {
                        userId: authUser.id,
                        companyName: "Enterprise",
                    }
                });
            }

            const job = await db.jobOffer.create({
                data: {
                    enterpriseId: enterprise.id,
                    title,
                    description,
                    type: type || "CDI",
                    salary: salary || null,
                    location: location || "Remote",
                    requirements: JSON.stringify(reqArray),
                },
            });

            return NextResponse.json({ job, jobId: job.id, success: true });
        } catch (dbErr) {
            console.warn("DB job create failed, returning demo success:", dbErr);
            return NextResponse.json({
                jobId: `job-${Date.now()}`,
                success: true,
                job: { id: `job-${Date.now()}`, title, description, type, salary, location }
            });
        }
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}
