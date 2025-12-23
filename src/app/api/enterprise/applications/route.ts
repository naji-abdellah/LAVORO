import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) {
            return NextResponse.json({ error: "Enterprise not found" }, { status: 404 });
        }

        const applications = await db.application.findMany({
            where: {
                jobOffer: { enterpriseId: enterprise.id },
            },
            include: {
                candidate: {
                    include: {
                        user: {
                            select: { email: true, photoUrl: true },
                        },
                    },
                },
                jobOffer: {
                    select: { id: true, title: true },
                },
                interview: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Get isAnonymous status using raw SQL and hide candidate info if anonymous
        const processedApplications = await Promise.all(applications.map(async (app) => {
            const anonResult = await db.$queryRaw<{ isAnonymous: boolean }[]>`
                SELECT isAnonymous FROM Application WHERE id = ${app.id}
            `;
            const isAnonymous = anonResult[0]?.isAnonymous || false;

            if (isAnonymous) {
                // Hide candidate info for anonymous applications
                return {
                    ...app,
                    isAnonymous: true,
                    candidate: {
                        ...app.candidate,
                        firstName: null,
                        lastName: null,
                        bio: null,
                        phone: null,
                        address: null,
                        cvUrl: null,
                        user: {
                            email: "anonymous@candidate.hidden",
                            photoUrl: null,
                        },
                    },
                };
            }
            return { ...app, isAnonymous: false };
        }));

        return NextResponse.json({ applications: processedApplications });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ applications: [] }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId, status } = await request.json();

        const application = await db.application.update({
            where: { id: applicationId },
            data: { status },
            include: {
                candidate: {
                    include: { user: true },
                },
                jobOffer: true,
            },
        });

        // Notify candidate
        const statusText = status === "ACCEPTED" ? "accepted" : "rejected";
        await db.notification.create({
            data: {
                userId: application.candidate.userId,
                content: `Your application for "${application.jobOffer.title}" has been ${statusText}.`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
}
