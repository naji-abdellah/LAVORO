"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CANDIDATE", "ENTERPRISE"]),
    // Candidate fields
    skills: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    // Enterprise fields
    companyName: z.string().optional(),
    description: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
});

export async function registerUser(formData: FormData) {
    try {
        // Helper to convert null to undefined for Zod
        const getString = (key: string) => {
            const value = formData.get(key);
            return value ? String(value) : undefined;
        };

        const data = {
            email: getString("email") || "",
            password: getString("password") || "",
            role: (getString("role") || "CANDIDATE") as "CANDIDATE" | "ENTERPRISE",
            skills: getString("skills"),
            bio: getString("bio"),
            phone: getString("phone"),
            address: getString("address"),
            companyName: getString("companyName"),
            description: getString("description"),
            industry: getString("industry"),
            location: getString("location"),
        };

        const validated = registerSchema.safeParse(data);

        if (!validated.success) {
            const firstIssue = validated.error.issues[0];
            return { error: firstIssue?.message || "Validation failed" };
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return { error: "Email already registered" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user with profile
        const user = await db.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role,
                ...(data.role === "CANDIDATE"
                    ? {
                        candidateProfile: {
                            create: {
                                skills: data.skills || "[]",
                                bio: data.bio || null,
                                phone: data.phone || null,
                                address: data.address || null,
                            },
                        },
                    }
                    : {
                        enterpriseProfile: {
                            create: {
                                companyName: data.companyName || "Company Name",
                                description: data.description || null,
                                industry: data.industry || null,
                                location: data.location || null,
                            },
                        },
                    }),
            },
        });

        return { success: true, userId: user.id };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "An error occurred during registration" };
    }
}

export async function createNotification(userId: string, content: string) {
    try {
        await db.notification.create({
            data: {
                userId,
                content,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Notification error:", error);
        return { error: "Failed to create notification" };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { error: "Failed to update notification" };
    }
}

export async function getNotifications(userId: string) {
    try {
        const notifications = await db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return { notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { notifications: [] };
    }
}
