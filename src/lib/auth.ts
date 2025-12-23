import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            role: "ADMIN" | "CANDIDATE" | "ENTERPRISE";
            isActive: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        role: "ADMIN" | "CANDIDATE" | "ENTERPRISE";
        isActive: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        role: "ADMIN" | "CANDIDATE" | "ENTERPRISE";
        isActive: boolean;
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                if (!user.isActive) {
                    // Get deactivation reason using raw SQL
                    const reasonResult = await db.$queryRaw<{ deactivationReason: string | null }[]>`
                        SELECT deactivationReason FROM User WHERE id = ${user.id}
                    `;
                    const reason = reasonResult[0]?.deactivationReason;

                    if (reason) {
                        throw new Error(`DEACTIVATED:${reason}`);
                    } else {
                        throw new Error("DEACTIVATED:Your account has been deactivated. Please contact support for more information.");
                    }
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.isActive = user.isActive;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id,
                email: token.email,
                role: token.role,
                isActive: token.isActive,
            };
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
