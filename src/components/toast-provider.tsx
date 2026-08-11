"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            expand={false}
            closeButton
            toastOptions={{
                duration: 4000,
                className: "font-sans",
            }}
        />
    );
}
