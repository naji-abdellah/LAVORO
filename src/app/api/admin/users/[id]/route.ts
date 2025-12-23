import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId } = await params;

        // Use raw SQL to get all user info including new fields
        const userResult = await db.$queryRaw<{
            id: string;
            email: string;
            role: string;
            isActive: boolean;
            photoUrl: string | null;
            createdAt: Date;
        }[]>`
            SELECT id, email, role, isActive, photoUrl, createdAt FROM User WHERE id = ${userId}
        `;

        if (!userResult.length) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userResult[0];
        let profile = null;

        // Get candidate profile if user is a candidate
        if (user.role === "CANDIDATE") {
            const profileResult = await db.$queryRaw<{
                id: string;
                firstName: string | null;
                lastName: string | null;
                bio: string | null;
                phone: string | null;
                address: string | null;
                skills: string;
                cvUrl: string | null;
            }[]>`
                SELECT id, firstName, lastName, bio, phone, address, skills, cvUrl 
                FROM CandidateProfile 
                WHERE userId = ${userId}
            `;

            if (profileResult.length) {
                profile = {
                    type: "candidate",
                    ...profileResult[0],
                    skills: JSON.parse(profileResult[0].skills || "[]"),
                };
            }
        }

        // Get enterprise profile if user is an enterprise
        if (user.role === "ENTERPRISE") {
            const profileResult = await db.$queryRaw<{
                id: string;
                companyName: string;
                description: string | null;
                industry: string | null;
                location: string | null;
                logoUrl: string | null;
            }[]>`
                SELECT id, companyName, description, industry, location, logoUrl 
                FROM EnterpriseProfile 
                WHERE userId = ${userId}
            `;

            if (profileResult.length) {
                profile = {
                    type: "enterprise",
                    ...profileResult[0],
                };
            }
        }

        // Get application count for candidates
        let applicationCount = 0;
        if (user.role === "CANDIDATE") {
            const countResult = await db.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(*) as count FROM Application a
                JOIN CandidateProfile cp ON a.candidateId = cp.id
                WHERE cp.userId = ${userId}
            `;
            applicationCount = Number(countResult[0]?.count || 0);
        }

        // Get job count for enterprises
        let jobCount = 0;
        if (user.role === "ENTERPRISE") {
            const countResult = await db.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(*) as count FROM JobOffer jo
                JOIN EnterpriseProfile ep ON jo.enterpriseId = ep.id
                WHERE ep.userId = ${userId}
            `;
            jobCount = Number(countResult[0]?.count || 0);
        }

        return NextResponse.json({
            user: {
                ...user,
                createdAt: user.createdAt.toISOString(),
            },
            profile,
            stats: {
                applicationCount,
                jobCount,
            },
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
}
