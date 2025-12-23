import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: [] }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await request.json();

        await db.jobOffer.delete({
            where: { id: jobId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }
}
