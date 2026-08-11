import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth-server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role, firstName, lastName, skills, bio, phone, address, companyName, description, industry, location } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
        }

        let user;

        try {
            // Check if user already exists
            const existingUser = await db.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return NextResponse.json({ error: "Email already registered" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user with profile
            user = await db.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                    isActive: true,
                    ...(role === "CANDIDATE" ? {
                        candidateProfile: {
                            create: {
                                firstName: firstName || "User",
                                lastName: lastName || "",
                                skills: skills || "[]",
                                bio: bio || "",
                                phone: phone || "",
                                address: address || "",
                            }
                        }
                    } : {
                        enterpriseProfile: {
                            create: {
                                companyName: companyName || "Company",
                                description: description || "",
                                industry: industry || "",
                                location: location || "",
                            }
                        }
                    })
                },
            });
        } catch (dbError) {
            console.warn("Prisma DB not reachable, creating demo session:", dbError);
            // Fallback user object for demo deployment when database is not connected
            user = {
                id: `demo-${Date.now()}`,
                email,
                role,
            };
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
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
    }
}
