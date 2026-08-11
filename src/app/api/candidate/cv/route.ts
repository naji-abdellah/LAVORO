import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("cv") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate file type - only PDF allowed
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Invalid file type. Please upload a PDF file." }, { status: 400 });
        }

        // Validate file size (max 10MB for CVs)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "cvs");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const filename = `cv-${session.user.id}-${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update candidate's cvUrl in database using raw SQL
        const cvUrl = `/uploads/cvs/${filename}`;
        await db.$executeRaw`
            UPDATE CandidateProfile 
            SET cvUrl = ${cvUrl} 
            WHERE userId = ${session.user.id}
        `;

        return NextResponse.json({ success: true, cvUrl, fileName: file.name });
    } catch (error) {
        console.error("Error uploading CV:", error);
        return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CANDIDATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get candidate's CV using raw SQL
        const result = await db.$queryRaw<{ cvUrl: string | null }[]>`
            SELECT cvUrl FROM CandidateProfile WHERE userId = ${session.user.id}
        `;

        return NextResponse.json({ cvUrl: result[0]?.cvUrl || null });
    } catch (error) {
        console.error("Error fetching CV:", error);
        return NextResponse.json({ cvUrl: null }, { status: 200 });
    }
}
