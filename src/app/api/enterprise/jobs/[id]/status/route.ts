import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        await db.jobOffer.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error toggling job status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
