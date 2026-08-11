import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("logo") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 500 });
        }

        const ext = file.name.split(".").pop();
        const filename = `${authUser.id}-${Date.now()}.${ext}`;
        const logoUrl = `/uploads/logos/${filename}`;

        try {
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "logos");
            await mkdir(uploadsDir, { recursive: true });
            const filepath = path.join(uploadsDir, filename);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            await db.enterpriseProfile.update({
                where: { userId: authUser.id },
                data: { logoUrl },
            });
        } catch (err) {
            console.warn("Storage or DB update error during logo upload:", err);
        }

        return NextResponse.json({ success: true, logoUrl });
    } catch (error) {
        console.error("Error uploading logo:", error);
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "ENTERPRISE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const enterprise = await db.enterpriseProfile.findUnique({
                where: { userId: authUser.id },
                select: { logoUrl: true },
            });

            return NextResponse.json({ logoUrl: enterprise?.logoUrl || null });
        } catch {
            return NextResponse.json({ logoUrl: null });
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
        return NextResponse.json({ logoUrl: null });
    }
}
