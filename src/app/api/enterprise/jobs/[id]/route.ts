import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const job = await db.jobOffer.findUnique({
            where: { id },
            include: {
                enterprise: true,
            },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};
        if (body.status) updateData.status = body.status;
        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.type) updateData.type = body.type;
        if (body.salary !== undefined) updateData.salary = body.salary;
        if (body.location) updateData.location = body.location;
        if (body.requirements) {
            const reqArray = body.requirements.split(",").map((r: string) => r.trim()).filter((r: string) => r);
            updateData.requirements = JSON.stringify(reqArray);
        }

        const job = await db.jobOffer.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db.jobOffer.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }
}

// PUT method (alias for PATCH for full updates)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};
        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.type) updateData.type = body.type;
        if (body.salary !== undefined) updateData.salary = body.salary || null;
        if (body.location) updateData.location = body.location;
        if (body.requirements) {
            const reqArray = body.requirements.split(",").map((r: string) => r.trim()).filter((r: string) => r);
            updateData.requirements = JSON.stringify(reqArray);
        }

        const job = await db.jobOffer.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    }
}

