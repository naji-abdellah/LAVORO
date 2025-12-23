"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { FileText, Upload, Loader2, Check, ExternalLink, Trash2 } from "lucide-react";

interface CvUploadProps {
    currentCvUrl?: string | null;
    onCvChange?: (url: string | null) => void;
}

export function CvUpload({ currentCvUrl, onCvChange }: CvUploadProps) {
    const [cvUrl, setCvUrl] = useState<string | null>(currentCvUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file only.");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large. Maximum size is 10MB.");
            return;
        }

        setIsUploading(true);

        try {
            // Convert file to base64 data URL
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setCvUrl(dataUrl);
                onCvChange?.(dataUrl);
                toast.success("CV uploaded successfully!");
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast.error("Failed to read CV file");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch {
            toast.error("Failed to upload CV");
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setCvUrl(null);
        onCvChange?.(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
            />

            {cvUrl ? (
                // CV is uploaded - show success state
                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-green-800">CV Uploaded</p>
                            <p className="text-sm text-green-600 truncate">Your CV is ready for applications</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="View CV"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                            <button
                                onClick={handleRemove}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove CV"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleClick}
                        disabled={isUploading}
                        className="mt-3 w-full py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        {isUploading ? "Uploading..." : "Upload a different CV"}
                    </button>
                </div>
            ) : (
                // No CV uploaded - show upload area
                <div
                    onClick={handleClick}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 rounded-xl p-8 cursor-pointer transition-all"
                >
                    <div className="flex flex-col items-center gap-3 text-center">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                <p className="font-medium text-gray-700">Uploading your CV...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Click to upload your CV</p>
                                    <p className="text-sm text-gray-500 mt-1">PDF format only, max 10MB</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Your CV will be visible to employers when you apply to jobs</span>
            </div>
        </div>
    );
}
