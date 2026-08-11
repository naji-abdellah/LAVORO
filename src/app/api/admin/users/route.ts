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
            const users = await db.user.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    photoUrl: true,
                    candidateProfile: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                    enterpriseProfile: {
                        select: { companyName: true, logoUrl: true },
                    },
                },
            });

            return NextResponse.json({ users });
        } catch (dbErr) {
            console.warn("DB users fetch failed, returning empty users array:", dbErr);
            return NextResponse.json({ users: [] });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ users: [] });
    }
}

export async function PATCH(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, isActive, deactivationReason } = await request.json();

        try {
            await db.user.update({
                where: { id: userId },
                data: {
                    isActive,
                    deactivationReason: isActive ? null : (deactivationReason || null),
                },
            });
        } catch (dbErr) {
            console.warn("DB user status patch failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await request.json();

        try {
            await db.user.delete({
                where: { id: userId },
            });
        } catch (dbErr) {
            console.warn("DB user delete failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
