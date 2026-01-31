'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TailorStats {
    total_assigned: number;
    pending: number;
    completed_today: number;
    week_appointments: number;
    today_appointments: number;
}

interface Appointment {
    id: number;
    customer_id: number;
    scheduled_time: string;
    service_type: string;
    status: string;
    notes: string | null;
}

export default function TailorDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<TailorStats | null>(null);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch stats
            const statsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tailor/stats`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (statsResponse.status === 403) {
                setError('Access denied. Tailor privileges required.');
                return;
            }

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch today's appointments
            const appointmentsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments?limit=10`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                // Filter for today
                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appointmentsData.filter((apt: Appointment) =>
                    apt.scheduled_time.startsWith(today)
                );
                setTodayAppointments(todayAppts);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                    <h1 className="text-3xl font-bold text-gray-900">Tailor Dashboard</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* Total Assigned */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total_assigned || 0}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Completed Today */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.completed_today || 0}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Today's Appointments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Today</p>
                                <p className="text-3xl font-bold text-blue-600">{stats?.today_appointments || 0}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* This Week */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">This Week</p>
                                <p className="text-3xl font-bold text-indigo-600">{stats?.week_appointments || 0}</p>
                            </div>
                            <div className="bg-indigo-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                    </div>
                    <div className="p-6">
                        {todayAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {todayAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                        onClick={() => router.push(`/tailor/appointments/${appointment.id}`)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {formatTime(appointment.scheduled_time)}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{appointment.service_type}</p>
                                            <p className="text-xs text-gray-500">Customer ID: #{appointment.customer_id}</p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No appointments scheduled for today</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => router.push('/tailor/appointments')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Appointments</h3>
                        <p className="text-gray-600">View and manage all your appointments</p>
                    </button>

                    <button
                        onClick={() => router.push('/tailor/availability')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Availability</h3>
                        <p className="text-gray-600">Set your working hours and schedule</p>
                    </button>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer View</h3>
                        <p className="text-gray-600">Switch to customer dashboard</p>
                    </button>
                </div>
            </main>
        </div>
    );
}
