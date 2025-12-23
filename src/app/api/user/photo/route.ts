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

        // Use raw SQL to get photoUrl since Prisma client may not be regenerated yet
        const result = await db.$queryRaw<{ photoUrl: string | null }[]>`
            SELECT photoUrl FROM User WHERE id = ${session.user.id}
        `;

        return NextResponse.json({ photoUrl: result[0]?.photoUrl || null });
    } catch (error) {
        console.error("Error fetching photo:", error);
        return NextResponse.json({ photoUrl: null }, { status: 200 });
    }
}
