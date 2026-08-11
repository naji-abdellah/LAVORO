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
                return NextResponse.json({ applications: [] });
            }

            const applications = await db.application.findMany({
                where: { candidateId: candidateProfile.id },
                include: {
                    jobOffer: {
                        include: {
                            enterprise: {
                                select: {
                                    companyName: true,
                                    logoUrl: true,
                                },
                            },
                        },
                    },
                    interview: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return NextResponse.json({ applications });
        } catch (dbErr) {
            console.warn("DB not reachable, returning empty candidate applications array:", dbErr);
            return NextResponse.json({ applications: [] });
        }
    } catch (error) {
        console.error("Error fetching candidate applications:", error);
        return NextResponse.json({ applications: [] });
    }
}
