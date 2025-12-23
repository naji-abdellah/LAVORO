import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("logo") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "logos");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const filename = `${session.user.id}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update enterprise's logoUrl in database using raw SQL
        const logoUrl = `/uploads/logos/${filename}`;
        await db.$executeRaw`
            UPDATE EnterpriseProfile 
            SET logoUrl = ${logoUrl} 
            WHERE userId = ${session.user.id}
        `;

        return NextResponse.json({ success: true, logoUrl });
    } catch (error) {
        console.error("Error uploading logo:", error);
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get enterprise logo using raw SQL
        const result = await db.$queryRaw<{ logoUrl: string | null }[]>`
            SELECT logoUrl FROM EnterpriseProfile WHERE userId = ${session.user.id}
        `;

        return NextResponse.json({ logoUrl: result[0]?.logoUrl || null });
    } catch (error) {
        console.error("Error fetching logo:", error);
        return NextResponse.json({ logoUrl: null }, { status: 200 });
    }
}
