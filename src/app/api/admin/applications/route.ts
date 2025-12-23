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
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ applications: [] }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId, status, isAnonymous } = await request.json();

        // Use raw SQL to update both status and isAnonymous
        if (status !== undefined) {
            await db.$executeRaw`
                UPDATE Application SET status = ${status} WHERE id = ${applicationId}
            `;
        }

        if (isAnonymous !== undefined) {
            await db.$executeRaw`
                UPDATE Application SET isAnonymous = ${isAnonymous} WHERE id = ${applicationId}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId } = await request.json();

        // Delete interview first if exists
        await db.interview.deleteMany({
            where: { applicationId },
        });

        await db.application.delete({
            where: { id: applicationId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
    }
}
