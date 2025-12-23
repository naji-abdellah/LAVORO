"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, Loader2, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [deactivationReason, setDeactivationReason] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.error) {
                // Check if it's a deactivation error with reason
                if (result.error.startsWith("DEACTIVATED:")) {
                    const reason = result.error.replace("DEACTIVATED:", "");
                    setDeactivationReason(reason);
                } else {
                    toast.error(result.error);
                }
            } else {
                toast.success("Welcome back!");
                // Redirect based on role
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        if (payload.role === 'ADMIN') {
                            router.push('/admin');
                        } else if (payload.role === 'ENTERPRISE') {
                            router.push('/enterprise');
                        } else if (payload.role === 'CANDIDATE') {
                            router.push('/candidate');
                        } else {
                            router.push(callbackUrl);
                        }
                    } catch {
                        router.push(callbackUrl);
                    }
                } else {
                    router.push(callbackUrl);
                }
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Deactivation Reason Alert */}
            {deactivationReason && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-2">Account Deactivated</h4>
                    <p className="text-red-700 text-sm">{deactivationReason}</p>
                </div>
            )}

            {error === "inactive" && !deactivationReason && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    Your account has been deactivated. Please contact support.
                </div>
            )}

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

function LoginFormFallback() {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-pulse">
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-blue-200 rounded-xl"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/lavoro-logo-blue.png"
                            alt="LAVORO"
                            className="h-12 w-auto"
                        />
                        <span className="text-2xl font-bold tracking-wider text-gray-900" style={{ letterSpacing: '0.1em' }}>
                            LAVORO
                        </span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-gray-600">Sign in to your account</p>
                </div>

                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
