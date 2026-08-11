import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db.notification.updateMany({
            where: { userId: authUser.id, read: false },
            data: { read: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
