"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, User, Building2 } from "lucide-react";

export function Navbar() {
    const { user, logout, isAuthenticated, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get display name from user context
    const getDisplayName = () => {
        if (!user) return '';
        if ((user as any).companyName) {
            return (user as any).companyName;
        }
        if ((user as any).firstName || (user as any).lastName) {
            return [(user as any).firstName, (user as any).lastName].filter(Boolean).join(' ');
        }
        return user.email;
    };

    // Get user photo from context
    const getUserPhoto = () => {
        if (!user) return null;
        if (user.role === 'ENTERPRISE' && (user as any).logoUrl) {
            return (user as any).logoUrl;
        }
        return (user as any).photoUrl || null;
    };

    const displayName = getDisplayName();
    const userPhoto = getUserPhoto();

    const getDashboardLink = () => {
        if (!user) return "/";
        switch (user.role) {
            case "ADMIN":
                return "/admin";
            case "ENTERPRISE":
                return "/enterprise";
            case "CANDIDATE":
            default:
                return "/candidate";
        }
    };

    const isEnterprise = user?.role === "ENTERPRISE";

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/lavoro-logo-blue.png"
                            alt="LAVORO"
                            className="h-10 w-auto"
                        />
                        <span className="text-xl font-bold tracking-wider text-gray-900" style={{ letterSpacing: '0.1em' }}>
                            LAVORO
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            Browse Jobs
                        </Link>
                        <Link href="/#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            Features
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        ) : isAuthenticated && user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={getDashboardLink()}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <div className="flex items-center gap-2">
                                        {/* Profile photo or default icon */}
                                        {userPhoto ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={userPhoto}
                                                alt={isEnterprise ? "Company logo" : "Profile"}
                                                className={`w-8 h-8 object-cover border-2 border-white shadow-sm ${isEnterprise ? "rounded-lg" : "rounded-full"
                                                    }`}
                                            />
                                        ) : (
                                            <div className={`w-8 h-8 flex items-center justify-center ${isEnterprise ? "bg-purple-100 rounded-lg" : "bg-blue-100 rounded-full"
                                                }`}>
                                                {isEnterprise ? (
                                                    <Building2 className="w-4 h-4 text-purple-600" />
                                                ) : (
                                                    <User className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700">
                                            {displayName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            href="/"
                            className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/jobs"
                            className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Browse Jobs
                        </Link>
                        {isAuthenticated && user ? (
                            <>
                                {/* User info in mobile menu */}
                                <div className="flex items-center gap-3 px-4 py-2">
                                    {userPhoto ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={userPhoto}
                                            alt={isEnterprise ? "Company logo" : "Profile"}
                                            className={`w-10 h-10 object-cover border-2 border-white shadow-sm ${isEnterprise ? "rounded-lg" : "rounded-full"
                                                }`}
                                        />
                                    ) : (
                                        <div className={`w-10 h-10 flex items-center justify-center ${isEnterprise ? "bg-purple-100 rounded-lg" : "bg-blue-100 rounded-full"
                                            }`}>
                                            {isEnterprise ? (
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <User className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700">
                                        {displayName}
                                    </span>
                                </div>
                                <Link
                                    href={getDashboardLink()}
                                    className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="block px-4 py-2 text-center bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
