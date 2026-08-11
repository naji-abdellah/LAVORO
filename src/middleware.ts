import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Middleware authentication is disabled in favor of Client-Side Authentication
    // using Jakarta EE backend and AuthContext.
    // Logic for route protection is now handled in the components/pages themselves.

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
