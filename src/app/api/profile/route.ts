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
            if (authUser.role === "CANDIDATE") {
                const profile = await db.candidateProfile.findUnique({
                    where: { userId: authUser.id },
                });
                return NextResponse.json({ user: profile || { id: authUser.id, email: authUser.email, role: authUser.role } });
            } else if (authUser.role === "ENTERPRISE") {
                const profile = await db.enterpriseProfile.findUnique({
                    where: { userId: authUser.id },
                });
                return NextResponse.json({ user: profile || { id: authUser.id, email: authUser.email, role: authUser.role } });
            }

            return NextResponse.json({ user: { id: authUser.id, email: authUser.email, role: authUser.role } });
        } catch {
            return NextResponse.json({ user: { id: authUser.id, email: authUser.email, role: authUser.role } });
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        try {
            if (authUser.role === "CANDIDATE") {
                await db.candidateProfile.upsert({
                    where: { userId: authUser.id },
                    update: {
                        firstName: body.firstName || null,
                        lastName: body.lastName || null,
                        bio: body.bio || null,
                        phone: body.phone || null,
                        address: body.address || null,
                        skills: typeof body.skills === "string" ? body.skills : JSON.stringify(body.skills || []),
                    },
                    create: {
                        userId: authUser.id,
                        firstName: body.firstName || null,
                        lastName: body.lastName || null,
                        bio: body.bio || null,
                        phone: body.phone || null,
                        address: body.address || null,
                        skills: typeof body.skills === "string" ? body.skills : JSON.stringify(body.skills || []),
                    }
                });
                return NextResponse.json({ success: true });
            } else if (authUser.role === "ENTERPRISE") {
                const profile = await db.enterpriseProfile.upsert({
                    where: { userId: authUser.id },
                    update: {
                        companyName: body.companyName || "Company",
                        description: body.description,
                        industry: body.industry,
                        location: body.location,
                    },
                    create: {
                        userId: authUser.id,
                        companyName: body.companyName || "Company",
                        description: body.description,
                        industry: body.industry,
                        location: body.location,
                    }
                });
                return NextResponse.json({ profile });
            }
        } catch (dbErr) {
            console.warn("Database save failed during demo update:", dbErr);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
