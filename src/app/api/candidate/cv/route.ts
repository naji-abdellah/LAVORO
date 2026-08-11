import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("cv") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Invalid file type. Please upload a PDF file." }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
        }

        const filename = `cv-${authUser.id}-${Date.now()}.pdf`;
        const cvUrl = `/uploads/cvs/${filename}`;

        try {
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "cvs");
            await mkdir(uploadsDir, { recursive: true });
            const filepath = path.join(uploadsDir, filename);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            await db.candidateProfile.update({
                where: { userId: authUser.id },
                data: { cvUrl },
            });
        } catch (err) {
            console.warn("Local storage or DB update error during CV upload:", err);
        }

        return NextResponse.json({ success: true, cvUrl, fileName: file.name });
    } catch (error) {
        console.error("Error uploading CV:", error);
        return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser || authUser.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const candidate = await db.candidateProfile.findUnique({
                where: { userId: authUser.id },
                select: { cvUrl: true },
            });

            return NextResponse.json({ cvUrl: candidate?.cvUrl || null });
        } catch {
            return NextResponse.json({ cvUrl: null });
        }
    } catch (error) {
        console.error("Error fetching CV:", error);
        return NextResponse.json({ cvUrl: null });
    }
}
