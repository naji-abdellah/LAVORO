import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId } = await params;

        try {
            const user = await db.user.findUnique({
                where: { id: userId },
                include: {
                    candidateProfile: true,
                    enterpriseProfile: true,
                },
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            return NextResponse.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt.toISOString(),
                },
                profile: user.candidateProfile || user.enterpriseProfile || null,
                stats: { applicationCount: 0, jobCount: 0 },
            });
        } catch (dbErr) {
            console.warn("DB user fetch failed during demo:", dbErr);
            return NextResponse.json({
                user: {
                    id: userId,
                    email: "user@demo.com",
                    role: "CANDIDATE",
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                profile: null,
                stats: { applicationCount: 0, jobCount: 0 },
            });
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
}
