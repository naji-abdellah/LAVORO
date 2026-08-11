"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Check, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Notification {
    id: string;
    content: string;
    read: boolean;
    createdAt: string;
}

export default function CandidateNotificationsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchNotifications();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated]);

    async function fetchNotifications() {
        try {
            const data = await notificationsApi.getNotifications();
            setNotifications(data.notifications || []);
        } catch {
            toast.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    }

    async function markAsRead(id: string) {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(
                notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch {
            toast.error("Failed to update notification");
        }
    }

    async function markAllAsRead() {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(notifications.map((n) => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to update notifications");
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                            : "You're all caught up!"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        <Check className="w-5 h-5" />
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border transition-all ${notification.read
                                ? "bg-white border-gray-100"
                                : "bg-blue-50 border-blue-100"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.read ? "bg-gray-100" : "bg-blue-100"
                                        }`}
                                >
                                    <Bell
                                        className={`w-5 h-5 ${notification.read ? "text-gray-400" : "text-blue-600"
                                            }`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-medium"
                                            }`}
                                    >
                                        {notification.content}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(new Date(notification.createdAt))}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Mark read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-600">You'll receive notifications about your applications here</p>
                </div>
            )}
        </div>
    );
}
