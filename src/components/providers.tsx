"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/AuthContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </SessionProvider>
    );
}
