import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("photo") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
        }

        const ext = file.name.split(".").pop();
        const filename = `${authUser.id}-${Date.now()}.${ext}`;
        const photoUrl = `/uploads/profiles/${filename}`;

        try {
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
            await mkdir(uploadsDir, { recursive: true });
            const filepath = path.join(uploadsDir, filename);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            await db.user.update({
                where: { id: authUser.id },
                data: { photoUrl },
            });
        } catch (err) {
            console.warn("Storage or DB update error during photo upload:", err);
        }

        return NextResponse.json({ success: true, photoUrl });
    } catch (error) {
        console.error("Error uploading photo:", error);
        return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
    }
}
