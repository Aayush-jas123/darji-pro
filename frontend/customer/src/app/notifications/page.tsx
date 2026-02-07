"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Notification {
    id: number;
    channel: string;
    subject?: string;
    message: string;
    status: string;
    recipient_address: string;
    related_resource_type?: string;
    related_resource_id?: number;
    sent_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    email: number;
    in_app: number;
    sms: number;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = filter === 'unread' ? '?unread_only=true' : '';
            const response = await api.get(`/api/notifications${params}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showMessage('error', 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/notifications/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await api.patch(`/api/notifications/${notificationId}/read`);
            await fetchNotifications();
            await fetchStats();
            showMessage('success', 'Notification marked as read');
        } catch (error) {
            console.error('Failed to mark as read:', error);
            showMessage('error', 'Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/api/notifications/mark-all-read');
            await fetchNotifications();
            await fetchStats();
            showMessage('success', 'All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            showMessage('error', 'Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId: number) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            await api.delete(`/api/notifications/${notificationId}`);
            await fetchNotifications();
            await fetchStats();
            setSelectedNotification(null);
            showMessage('success', 'Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            showMessage('error', 'Failed to delete notification');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return;

        try {
            await api.delete('/api/notifications');
            await fetchNotifications();
            await fetchStats();
            showMessage('success', 'All notifications deleted');
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
            showMessage('error', 'Failed to delete all notifications');
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'sms':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                );
            default: // in_app
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    const isUnread = (notification: Notification) => {
        return notification.status !== 'delivered';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Manage your notifications and stay updated</p>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unread</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.unread}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In-App</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.in_app}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-2xl font-bold text-green-600">{stats.email}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Unread {stats && stats.unread > 0 && `(${stats.unread})`}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {stats && stats.unread > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Mark All as Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-6 hover:bg-gray-50 transition-colors ${isUnread(notification) ? 'bg-purple-50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`p-2 rounded-full ${isUnread(notification) ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getChannelIcon(notification.channel)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {notification.subject && (
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                            {notification.subject}
                                        </h3>
                                    )}
                                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{formatDate(notification.created_at)}</span>
                                        <span className="capitalize">{notification.channel}</span>
                                        {isUnread(notification) && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {isUnread(notification) && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
