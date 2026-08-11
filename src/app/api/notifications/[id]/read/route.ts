import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await db.notification.update({
            where: { id },
            data: { read: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notification read:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}
