import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) {
            return NextResponse.json({ error: "Enterprise not found" }, { status: 404 });
        }

        const jobs = await db.jobOffer.findMany({
            where: { enterpriseId: enterprise.id },
            include: {
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const enterprise = await db.enterpriseProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!enterprise) {
            return NextResponse.json({ error: "Enterprise not found" }, { status: 404 });
        }

        const body = await request.json();
        const { title, description, type, salary, location, requirements } = body;

        // Convert comma-separated requirements to JSON array
        const reqArray = requirements
            ? requirements.split(",").map((r: string) => r.trim()).filter((r: string) => r)
            : [];

        const job = await db.jobOffer.create({
            data: {
                enterpriseId: enterprise.id,
                title,
                description,
                type,
                salary: salary || null,
                location,
                requirements: JSON.stringify(reqArray),
            },
        });

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}
