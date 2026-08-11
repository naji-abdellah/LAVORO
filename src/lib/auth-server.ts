import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "lavoro-secret-key-change-in-production";

export function createToken(user: { id: string; email: string; role: string }) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
    const payload = Buffer.from(JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })).toString("base64");

    const signature = crypto
        .createHmac("sha256", SECRET)
        .update(`${header}.${payload}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${header}.${payload}.${signature}`;
}

export function decodeToken(token: string) {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        if (payload.exp && payload.exp * 1000 < Date.now()) return null;
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role as "ADMIN" | "CANDIDATE" | "ENTERPRISE",
        };
    } catch {
        return null;
    }
}

export async function getAuthUser(request?: Request) {
    // 1. Try Bearer token from headers
    if (request) {
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const user = decodeToken(token);
            if (user) return user;
        }
    }

    // 2. Fall back to NextAuth session
    try {
        const session = await getServerSession(authOptions);
        if (session?.user) {
            return {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
            };
        }
    } catch {
        // ignore session errors
    }

    return null;
}
