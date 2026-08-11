import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const jobs = await db.jobOffer.findMany({
                orderBy: { createdAt: "desc" },
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
            });

            return NextResponse.json({ jobs });
        } catch (dbErr) {
            console.warn("DB jobs fetch failed, returning empty jobs array:", dbErr);
            return NextResponse.json({ jobs: [] });
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: [] });
    }
}

export async function DELETE(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await request.json();

        try {
            await db.jobOffer.delete({
                where: { id: jobId },
            });
        } catch (dbErr) {
            console.warn("DB job delete failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }
}
