"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
    LayoutDashboard,
    User,
    Briefcase,
    FileText,
    Bell,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Building2,
    Calendar,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
    role: "candidate" | "enterprise" | "admin";
}

const menuItems = {
    candidate: [
        { name: "Dashboard", href: "/candidate", icon: LayoutDashboard },
        { name: "My Profile", href: "/candidate/profile", icon: User },
        { name: "Browse Jobs", href: "/candidate/jobs", icon: Briefcase },
        { name: "My Applications", href: "/candidate/applications", icon: FileText },
        { name: "Notifications", href: "/candidate/notifications", icon: Bell },
    ],
    enterprise: [
        { name: "Dashboard", href: "/enterprise", icon: LayoutDashboard },
        { name: "Job Offers", href: "/enterprise/jobs", icon: Briefcase },
        { name: "Applications", href: "/enterprise/applications", icon: FileText },
        { name: "Company Profile", href: "/enterprise/profile", icon: Building2 },
    ],
    admin: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: User },
        { name: "Applications", href: "/admin/applications", icon: FileText },
        { name: "Interviews", href: "/admin/interviews", icon: Calendar },
        { name: "Job Moderation", href: "/admin/moderation", icon: Briefcase },
        { name: "My Profile", href: "/admin/profile", icon: User },
    ],
};

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const items = menuItems[role];

    // Get display name from user context
    const getDisplayName = () => {
        if (!user) return '';
        if (role === 'enterprise' && (user as any).companyName) {
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
        if (role === 'enterprise' && (user as any).logoUrl) {
            return (user as any).logoUrl;
        }
        return (user as any).photoUrl || null;
    };

    const displayName = getDisplayName();
    const userPhoto = getUserPhoto();

    const roleLabel = {
        candidate: "Candidate",
        enterprise: "Enterprise",
        admin: "Administrator",
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
            >
                {mobileOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/lavoro-logo-blue.png"
                                alt="LAVORO"
                                className="h-10 w-auto"
                            />
                            <div>
                                <span className="text-xl font-bold tracking-wider text-gray-900" style={{ letterSpacing: '0.08em' }}>
                                    LAVORO
                                </span>
                                <p className="text-xs text-gray-500">{roleLabel[role]} Portal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
                                    <span>{item.name}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
                            {/* Profile photo/logo or default icon */}
                            {userPhoto ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={userPhoto}
                                    alt={role === "enterprise" ? "Company logo" : "Profile"}
                                    className={`w-10 h-10 object-cover border-2 border-white shadow-sm ${role === "enterprise" ? "rounded-lg" : "rounded-full"
                                        }`}
                                />
                            ) : (
                                <div className={`w-10 h-10 flex items-center justify-center ${role === "enterprise"
                                    ? "bg-purple-100 rounded-lg"
                                    : "bg-blue-100 rounded-full"
                                    }`}>
                                    {role === "enterprise" ? (
                                        <Building2 className="w-5 h-5 text-purple-600" />
                                    ) : (
                                        <User className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500">{roleLabel[role]}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
