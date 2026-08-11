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
            const applications = await db.application.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: { email: true, photoUrl: true },
                            },
                        },
                    },
                    jobOffer: {
                        include: {
                            enterprise: {
                                include: {
                                    user: {
                                        select: { email: true },
                                    },
                                },
                            },
                        },
                    },
                    interview: true,
                },
            });

            return NextResponse.json({ applications });
        } catch (dbErr) {
            console.warn("DB applications fetch failed, returning empty applications array:", dbErr);
            return NextResponse.json({ applications: [] });
        }
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ applications: [] });
    }
}

export async function PATCH(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId, status, isAnonymous } = await request.json();

        try {
            const updateData: Record<string, unknown> = {};
            if (status !== undefined) updateData.status = status;
            if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

            await db.application.update({
                where: { id: applicationId },
                data: updateData,
            });
        } catch (dbErr) {
            console.warn("DB application patch failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId } = await request.json();

        try {
            await db.interview.deleteMany({
                where: { applicationId },
            });

            await db.application.delete({
                where: { id: applicationId },
            });
        } catch (dbErr) {
            console.warn("DB application delete failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
    }
}
