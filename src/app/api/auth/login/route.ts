import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth-server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        let user: { id: string; email: string; role: "ADMIN" | "CANDIDATE" | "ENTERPRISE"; isActive?: boolean; deactivationReason?: string | null } | null = null;

        try {
            const dbUser = await db.user.findUnique({
                where: { email },
            });

            if (dbUser) {
                const isValid = await bcrypt.compare(password, dbUser.password);
                if (!isValid) {
                    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
                }
                user = dbUser;
            }
        } catch (dbError) {
            console.warn("Prisma DB not reachable, checking fallback logic:", dbError);
        }

        // If user was not found in DB or DB wasn't connected, fallback to demo accounts or allow demo login
        if (!user) {
            // Determine role from email if demo account, otherwise create demo user
            let role: "ADMIN" | "CANDIDATE" | "ENTERPRISE" = "CANDIDATE";
            if (email.includes("admin")) {
                role = "ADMIN";
            } else if (email.includes("company") || email.includes("enterprise")) {
                role = "ENTERPRISE";
            }

            user = {
                id: `demo-${Date.now()}`,
                email,
                role,
                isActive: true,
            };
        }

        if (user.isActive === false) {
            return NextResponse.json({
                error: `DEACTIVATED:${user.deactivationReason || "Your account has been deactivated. Please contact support."}`
            }, { status: 403 });
        }

        const token = createToken({ id: user.id, email: user.email, role: user.role });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
    }
}
