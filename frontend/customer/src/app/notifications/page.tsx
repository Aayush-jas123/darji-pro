'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Filter, ArrowLeft } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, Notification } from '@/lib/api/notifications';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [channelFilter, setChannelFilter] = useState<string>('all');

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const unreadOnly = filter === 'unread';
            const data = await getNotifications(token, unreadOnly);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await markAsRead(token, notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, status: 'delivered' } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await markAllAsRead(token);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await deleteNotification(token, notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await deleteAllNotifications(token);
            setNotifications([]);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const getChannelBadge = (channel: string) => {
        const colors: Record<string, string> = {
            email: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            sms: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            in_app: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        };
        return colors[channel] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const filteredNotifications = channelFilter === 'all'
        ? notifications
        : notifications.filter(n => n.channel === channelFilter);

    const unreadCount = notifications.filter(n => n.status !== 'delivered').length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark all read
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteAll}
                                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete all
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => setChannelFilter('all')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${channelFilter === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                All Channels
                            </button>
                            <button
                                onClick={() => setChannelFilter('email')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${channelFilter === 'email'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Email
                            </button>
                            <button
                                onClick={() => setChannelFilter('in_app')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${channelFilter === 'in_app'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                In-App
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No notifications
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow ${notification.status !== 'delivered' ? 'border-l-4 border-blue-500' : ''
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getChannelBadge(notification.channel)}`}>
                                                    {notification.channel}
                                                </span>
                                                {notification.status !== 'delivered' && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>
                                            {notification.subject && (
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    {notification.subject}
                                                </h3>
                                            )}
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {getTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {notification.status !== 'delivered' && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
