/**
 * Notification API Client
 * Handles all notification-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Notification {
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

export interface NotificationStats {
    total: number;
    unread: number;
    email: number;
    in_app: number;
    sms: number;
}

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications(token: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
        const params = new URLSearchParams();
        if (unreadOnly) params.append('unread_only', 'true');

        const response = await axios.get(`${API_BASE_URL}/api/notifications?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(token: string): Promise<number> {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.unread_count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(token: string): Promise<NotificationStats> {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        return { total: 0, unread: 0, email: 0, in_app: 0, sms: 0 };
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(token: string, notificationId: number): Promise<Notification> {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/notifications/${notificationId}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(token: string): Promise<void> {
    try {
        await axios.post(
            `${API_BASE_URL}/api/notifications/mark-all-read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(token: string, notificationId: number): Promise<void> {
    try {
        await axios.delete(`${API_BASE_URL}/api/notifications/${notificationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(token: string): Promise<void> {
    try {
        await axios.delete(`${API_BASE_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
}
