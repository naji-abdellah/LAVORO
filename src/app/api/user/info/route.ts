import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use raw SQL to get all user info including new fields
        const userResult = await db.$queryRaw<{
            email: string;
            role: string;
            photoUrl: string | null;
        }[]>`
            SELECT email, role, photoUrl FROM User WHERE id = ${session.user.id}
        `;

        if (!userResult.length) {
            return NextResponse.json({ displayName: null, photoUrl: null, email: null });
        }

        const user = userResult[0];
        let displayName = user.email;

        // For candidates, get firstName + lastName from CandidateProfile
        if (user.role === "CANDIDATE") {
            const profileResult = await db.$queryRaw<{
                firstName: string | null;
                lastName: string | null;
            }[]>`
                SELECT firstName, lastName FROM CandidateProfile WHERE userId = ${session.user.id}
            `;

            if (profileResult.length) {
                const firstName = profileResult[0].firstName;
                const lastName = profileResult[0].lastName;
                if (firstName || lastName) {
                    displayName = [firstName, lastName].filter(Boolean).join(" ");
                }
            }
        }

        // For enterprises, get company name from EnterpriseProfile
        if (user.role === "ENTERPRISE") {
            const profileResult = await db.$queryRaw<{
                companyName: string | null;
            }[]>`
                SELECT companyName FROM EnterpriseProfile WHERE userId = ${session.user.id}
            `;

            if (profileResult.length && profileResult[0].companyName) {
                displayName = profileResult[0].companyName;
            }
        }

        return NextResponse.json({
            displayName,
            photoUrl: user.photoUrl,
            email: user.email
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json({ displayName: null, photoUrl: null, email: null }, { status: 200 });
    }
}
