import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId, date, meetingLink } = await request.json();

        // Check if interview already exists
        const existingInterview = await db.interview.findUnique({
            where: { applicationId },
        });

        if (existingInterview) {
            await db.interview.update({
                where: { applicationId },
                data: {
                    date: new Date(date),
                    meetingLink,
                    status: "SCHEDULED",
                },
            });
        } else {
            await db.interview.create({
                data: {
                    applicationId,
                    date: new Date(date),
                    meetingLink,
                },
            });
        }

        // Update application status
        const application = await db.application.update({
            where: { id: applicationId },
            data: { status: "INTERVIEW_SCHEDULED" },
            include: {
                candidate: {
                    include: { user: true },
                },
                jobOffer: true,
            },
        });

        // Notify candidate
        await db.notification.create({
            data: {
                userId: application.candidate.userId,
                content: `Interview scheduled for "${application.jobOffer.title}"! Check your applications for the meeting link.`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error scheduling interview:", error);
        return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
    }
}
