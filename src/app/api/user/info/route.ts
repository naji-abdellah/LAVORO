import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const user = await db.user.findUnique({
                where: { id: authUser.id },
                include: {
                    candidateProfile: true,
                    enterpriseProfile: true,
                },
            });

            if (!user) {
                return NextResponse.json({
                    id: authUser.id,
                    email: authUser.email,
                    role: authUser.role,
                    isActive: true,
                    displayName: authUser.email,
                    photoUrl: null,
                });
            }

            let displayName = user.email;

            if (user.role === "CANDIDATE" && user.candidateProfile) {
                const { firstName, lastName } = user.candidateProfile;
                if (firstName || lastName) {
                    displayName = [firstName, lastName].filter(Boolean).join(" ");
                }
            } else if (user.role === "ENTERPRISE" && user.enterpriseProfile) {
                if (user.enterpriseProfile.companyName) {
                    displayName = user.enterpriseProfile.companyName;
                }
            }

            return NextResponse.json({
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                displayName,
                photoUrl: user.photoUrl,
            });
        } catch {
            return NextResponse.json({
                id: authUser.id,
                email: authUser.email,
                role: authUser.role,
                isActive: true,
                displayName: authUser.email,
                photoUrl: null,
            });
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json({ displayName: null, photoUrl: null, email: null }, { status: 200 });
    }
}
