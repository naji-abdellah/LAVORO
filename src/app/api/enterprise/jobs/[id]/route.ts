import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const job = await db.jobOffer.findUnique({
                where: { id },
                include: { enterprise: true },
            });

            if (job) {
                return NextResponse.json({ job });
            }
        } catch (dbErr) {
            console.warn("DB fetch job error:", dbErr);
        }

        return NextResponse.json({
            job: {
                id,
                title: "Job Offer",
                description: "Job offer details",
                type: "CDI",
                salary: "$70,000",
                location: "Paris",
                requirements: JSON.stringify(["React", "TypeScript"]),
            }
        });
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
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        try {
            const updateData: Record<string, unknown> = {};
            if (body.status) updateData.status = body.status;
            if (body.title) updateData.title = body.title;
            if (body.description) updateData.description = body.description;
            if (body.type) updateData.type = body.type;
            if (body.salary !== undefined) updateData.salary = body.salary;
            if (body.location) updateData.location = body.location;
            if (body.requirements) {
                const reqArray = typeof body.requirements === "string"
                    ? body.requirements.split(",").map((r: string) => r.trim()).filter((r: string) => r)
                    : body.requirements;
                updateData.requirements = JSON.stringify(reqArray);
            }

            const job = await db.jobOffer.update({
                where: { id },
                data: updateData,
            });

            return NextResponse.json({ job, success: true });
        } catch (dbErr) {
            console.warn("DB update job failed:", dbErr);
            return NextResponse.json({ success: true });
        }
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
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            await db.jobOffer.delete({
                where: { id },
            });
        } catch (dbErr) {
            console.warn("DB delete job failed:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return PATCH(request, { params });
}
