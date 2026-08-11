"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Building2 } from "lucide-react";

interface LogoUploadProps {
    currentLogoUrl?: string | null;
    onLogoChange?: (url: string) => void;
}

export function LogoUpload({ currentLogoUrl, onLogoChange }: LogoUploadProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP, or SVG).");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Maximum size is 5MB.");
            return;
        }

        setIsUploading(true);

        try {
            // Convert file to base64 data URL
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setLogoUrl(dataUrl);
                onLogoChange?.(dataUrl);
                toast.success("Logo updated successfully!");
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast.error("Failed to read logo file");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch {
            toast.error("Failed to upload logo");
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                onClick={handleClick}
                className="relative w-32 h-32 rounded-2xl bg-gray-100 border-4 border-white shadow-lg cursor-pointer group overflow-hidden"
            >
                {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logoUrl}
                        alt="Company logo"
                        className="w-full h-full object-contain p-2"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                        <Building2 className="w-16 h-16 text-purple-300" />
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white" />
                    )}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
            >
                {isUploading ? "Uploading..." : "Change logo"}
            </button>
        </div>
    );
}
