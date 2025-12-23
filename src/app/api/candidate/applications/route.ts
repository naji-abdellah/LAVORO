import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const candidateProfile = await db.candidateProfile.findUnique({
            where: { userId: session.user.id },
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
    } catch (error) {
        console.error("Error fetching candidate applications:", error);
        return NextResponse.json({ applications: [] }, { status: 500 });
    }
}
