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

        if (session.user.role === "CANDIDATE") {
            const profile = await db.candidateProfile.findUnique({
                where: { userId: session.user.id },
            });
            return NextResponse.json({ profile });
        } else if (session.user.role === "ENTERPRISE") {
            const profile = await db.enterpriseProfile.findUnique({
                where: { userId: session.user.id },
            });
            return NextResponse.json({ profile });
        }

        return NextResponse.json({ profile: null });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (session.user.role === "CANDIDATE") {
            // Use raw SQL to update profile including new fields
            await db.$executeRaw`
                UPDATE CandidateProfile 
                SET firstName = ${body.firstName || null},
                    lastName = ${body.lastName || null},
                    bio = ${body.bio || null},
                    phone = ${body.phone || null},
                    address = ${body.address || null},
                    skills = ${body.skills || "[]"}
                WHERE userId = ${session.user.id}
            `;
            return NextResponse.json({ success: true });
        } else if (session.user.role === "ENTERPRISE") {
            const profile = await db.enterpriseProfile.update({
                where: { userId: session.user.id },
                data: {
                    companyName: body.companyName,
                    description: body.description,
                    industry: body.industry,
                    location: body.location,
                },
            });
            return NextResponse.json({ profile });
        }

        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
