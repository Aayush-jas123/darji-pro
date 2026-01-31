'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    users: {
        total: number;
        active: number;
        by_role: {
            customer: number;
            tailor: number;
            admin: number;
            staff: number;
        };
    };
    appointments: {
        total: number;
        by_status: {
            pending: number;
            confirmed: number;
            in_progress: number;
            completed: number;
            cancelled: number;
        };
    };
}

export default function AdminAnalytics() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const userRoleData = stats ? [
        { name: 'Customers', value: stats.users.by_role.customer, color: 'bg-green-500' },
        { name: 'Tailors', value: stats.users.by_role.tailor, color: 'bg-purple-500' },
        { name: 'Staff', value: stats.users.by_role.staff, color: 'bg-blue-500' },
        { name: 'Admins', value: stats.users.by_role.admin, color: 'bg-red-500' },
    ] : [];

    const appointmentStatusData = stats ? [
        { name: 'Pending', value: stats.appointments.by_status.pending, color: 'bg-yellow-500' },
        { name: 'Confirmed', value: stats.appointments.by_status.confirmed, color: 'bg-blue-500' },
        { name: 'In Progress', value: stats.appointments.by_status.in_progress, color: 'bg-purple-500' },
        { name: 'Completed', value: stats.appointments.by_status.completed, color: 'bg-green-500' },
        { name: 'Cancelled', value: stats.appointments.by_status.cancelled, color: 'bg-red-500' },
    ] : [];

    const maxUserValue = Math.max(...userRoleData.map(d => d.value), 1);
    const maxAppointmentValue = Math.max(...appointmentStatusData.map(d => d.value), 1);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Total Users</h2>
                        <p className="text-4xl font-bold text-blue-600">{stats?.users.total || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">{stats?.users.active || 0} active users</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Total Appointments</h2>
                        <p className="text-4xl font-bold text-purple-600">{stats?.appointments.total || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {stats?.appointments.by_status.completed || 0} completed
                        </p>
                    </div>
                </div>

                {/* User Distribution Chart */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">User Distribution by Role</h2>
                    <div className="space-y-4">
                        {userRoleData.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`${item.color} h-4 rounded-full transition-all duration-500`}
                                        style={{ width: `${(item.value / maxUserValue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appointment Status Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Status Distribution</h2>
                    <div className="space-y-4">
                        {appointmentStatusData.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`${item.color} h-4 rounded-full transition-all duration-500`}
                                        style={{ width: `${(item.value / maxAppointmentValue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Completion Rate</h3>
                        <p className="text-3xl font-bold">
                            {stats?.appointments.total
                                ? Math.round((stats.appointments.by_status.completed / stats.appointments.total) * 100)
                                : 0}%
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Pending Appointments</h3>
                        <p className="text-3xl font-bold">{stats?.appointments.by_status.pending || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Customer to Tailor Ratio</h3>
                        <p className="text-3xl font-bold">
                            {stats?.users.by_role.tailor
                                ? Math.round(stats.users.by_role.customer / stats.users.by_role.tailor)
                                : 0}:1
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
