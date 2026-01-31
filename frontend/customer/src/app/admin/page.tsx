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

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 403) {
                setError('Access denied. Admin privileges required.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard data');
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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.users.total || 0}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{stats?.users.active || 0} active users</p>
                    </div>

                    {/* Customers */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Customers</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.users.by_role.customer || 0}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Tailors */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tailors</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.users.by_role.tailor || 0}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Appointments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Appointments</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.appointments.total || 0}</p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{stats?.appointments.by_status.pending || 0} pending</p>
                    </div>
                </div>

                {/* Appointment Status Breakdown */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats?.appointments.by_status.pending || 0}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats?.appointments.by_status.confirmed || 0}</p>
                            <p className="text-sm text-gray-600">Confirmed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats?.appointments.by_status.in_progress || 0}</p>
                            <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats?.appointments.by_status.completed || 0}</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{stats?.appointments.by_status.cancelled || 0}</p>
                            <p className="text-sm text-gray-600">Cancelled</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                        <p className="text-gray-600">View and manage all users in the system</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/appointments')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Appointments</h3>
                        <p className="text-gray-600">View and manage all appointments</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/branches')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Branches</h3>
                        <p className="text-gray-600">View and manage branch locations</p>
                    </button>
                </div>
            </main>
        </div>
    );
}
