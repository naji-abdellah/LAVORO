import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, isActive, deactivationReason } = await request.json();

        // Use raw SQL to update user with deactivation reason
        if (isActive) {
            // When activating, clear the deactivation reason
            await db.$executeRaw`
                UPDATE User 
                SET isActive = true, deactivationReason = NULL 
                WHERE id = ${userId}
            `;
        } else {
            // When deactivating, set the reason
            await db.$executeRaw`
                UPDATE User 
                SET isActive = false, deactivationReason = ${deactivationReason || null} 
                WHERE id = ${userId}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await request.json();

        await db.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
