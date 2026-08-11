import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const candidateProfile = await db.candidateProfile.findUnique({
                where: { userId: authUser.id },
            });

            if (!candidateProfile) {
                return NextResponse.json({
                    stats: { applicationsCount: 0, interviewsCount: 0 },
                    recentApplications: [],
                });
            }

            const applications = await db.application.findMany({
                where: { candidateId: candidateProfile.id },
                include: {
                    jobOffer: {
                        include: {
                            enterprise: {
                                select: { companyName: true, logoUrl: true },
                            },
                        },
                    },
                    interview: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const interviewsCount = applications.filter(a => a.interview !== null).length;

            return NextResponse.json({
                stats: {
                    applicationsCount: applications.length,
                    interviewsCount,
                },
                recentApplications: applications,
            });
        } catch (dbError) {
            console.warn("DB not reachable, returning demo candidate stats:", dbError);
            return NextResponse.json({
                stats: { applicationsCount: 0, interviewsCount: 0 },
                recentApplications: [],
            });
        }
    } catch (error) {
        console.error("Error fetching candidate dashboard:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
    }
}
