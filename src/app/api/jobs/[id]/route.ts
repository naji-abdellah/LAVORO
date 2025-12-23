import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;

        const job = await db.jobOffer.findUnique({
            where: {
                id: jobId,
                status: "ACTIVE"
            },
            include: {
                enterprise: {
                    select: {
                        companyName: true,
                        description: true,
                        industry: true,
                        location: true,
                        logoUrl: true,
                    },
                },
                _count: {
                    select: { applications: true },
                },
            },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
    }
}
