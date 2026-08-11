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
                return NextResponse.json({
                    activeJobsCount: 0,
                    totalApplicationsCount: 0,
                    interviewsCount: 0,
                });
            }

            const jobs = await db.jobOffer.findMany({
                where: { enterpriseId: enterprise.id },
                include: {
                    applications: {
                        include: { interview: true },
                    },
                },
            });

            const activeJobsCount = jobs.filter(j => j.status === "ACTIVE").length;
            const totalApplicationsCount = jobs.reduce((acc, j) => acc + j.applications.length, 0);
            const interviewsCount = jobs.reduce((acc, j) => {
                return acc + j.applications.filter(a => a.interview !== null).length;
            }, 0);

            return NextResponse.json({
                activeJobsCount,
                totalApplicationsCount,
                interviewsCount,
            });
        } catch (dbError) {
            console.warn("DB not reachable, returning demo enterprise stats:", dbError);
            return NextResponse.json({
                activeJobsCount: 0,
                totalApplicationsCount: 0,
                interviewsCount: 0,
            });
        }
    } catch (error) {
        console.error("Error fetching enterprise dashboard:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
    }
}
