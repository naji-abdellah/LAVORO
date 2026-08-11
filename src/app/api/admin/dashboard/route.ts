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
            const [totalUsers, totalJobs, totalApplications, totalInterviews] = await Promise.all([
                db.user.count(),
                db.jobOffer.count(),
                db.application.count(),
                db.interview.count(),
            ]);

            return NextResponse.json({
                totalUsers,
                totalJobs,
                totalApplications,
                totalInterviews,
            });
        } catch (dbError) {
            console.warn("DB not reachable, returning demo admin stats:", dbError);
            return NextResponse.json({
                totalUsers: 0,
                totalJobs: 0,
                totalApplications: 0,
                totalInterviews: 0,
            });
        }
    } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
    }
}
