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
                select: { photoUrl: true },
            });

            return NextResponse.json({ photoUrl: user?.photoUrl || null });
        } catch {
            return NextResponse.json({ photoUrl: null });
        }
    } catch (error) {
        console.error("Error fetching photo:", error);
        return NextResponse.json({ photoUrl: null });
    }
}
