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

        const interviews = await db.interview.findMany({
            orderBy: { date: "desc" },
            include: {
                application: {
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
                    },
                },
            },
        });

        return NextResponse.json({ interviews });
    } catch (error) {
        console.error("Error fetching interviews:", error);
        return NextResponse.json({ interviews: [] }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId, status, date, meetingLink } = await request.json();

        const updateData: { status?: string; date?: Date; meetingLink?: string } = {};
        if (status) updateData.status = status;
        if (date) updateData.date = new Date(date);
        if (meetingLink) updateData.meetingLink = meetingLink;

        await db.interview.update({
            where: { id: interviewId },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating interview:", error);
        return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId } = await request.json();

        await db.interview.delete({
            where: { id: interviewId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting interview:", error);
        return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 });
    }
}
