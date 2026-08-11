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
            const notifications = await db.notification.findMany({
                where: { userId: authUser.id },
                orderBy: { createdAt: "desc" },
                take: 50,
            });

            const unreadCount = notifications.filter(n => !n.read).length;

            return NextResponse.json({ notifications, unreadCount });
        } catch (dbErr) {
            console.warn("DB not reachable, returning empty notifications:", dbErr);
            return NextResponse.json({ notifications: [], unreadCount: 0 });
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ notifications: [], unreadCount: 0 });
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
            if (body.markAll) {
                await db.notification.updateMany({
                    where: { userId: authUser.id, read: false },
                    data: { read: true },
                });
            } else if (body.notificationId) {
                await db.notification.update({
                    where: { id: body.notificationId },
                    data: { read: true },
                });
            }
        } catch (dbErr) {
            console.warn("DB update notification failed during demo:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}
