'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Prepare data for charts
    const userRoleData = stats ? [
        { name: 'Customers', value: stats.users.by_role.customer, fill: '#10b981' },
        { name: 'Tailors', value: stats.users.by_role.tailor, fill: '#8b5cf6' },
        { name: 'Staff', value: stats.users.by_role.staff, fill: '#3b82f6' },
        { name: 'Admins', value: stats.users.by_role.admin, fill: '#ef4444' },
    ] : [];

    const appointmentStatusData = stats ? [
        { name: 'Pending', value: stats.appointments.by_status.pending, fill: '#eab308' },
        { name: 'Confirmed', value: stats.appointments.by_status.confirmed, fill: '#3b82f6' },
        { name: 'In Progress', value: stats.appointments.by_status.in_progress, fill: '#8b5cf6' },
        { name: 'Completed', value: stats.appointments.by_status.completed, fill: '#10b981' },
        { name: 'Cancelled', value: stats.appointments.by_status.cancelled, fill: '#ef4444' },
    ] : [];

    // Mock trend data (in real app, this would come from API)
    const trendData = [
        { month: 'Jan', appointments: 45, revenue: 12000 },
        { month: 'Feb', appointments: 52, revenue: 15000 },
        { month: 'Mar', appointments: 61, revenue: 18000 },
        { month: 'Apr', appointments: 58, revenue: 16500 },
        { month: 'May', appointments: 70, revenue: 21000 },
        { month: 'Jun', appointments: 85, revenue: 25500 },
    ];

    const completionRate = stats?.appointments.total
        ? Math.round((stats.appointments.by_status.completed / stats.appointments.total) * 100)
        : 0;

    const customerToTailorRatio = stats?.users.by_role.tailor
        ? Math.round(stats.users.by_role.customer / stats.users.by_role.tailor)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Comprehensive business insights and metrics
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90 mb-1">Total Users</h3>
                        <p className="text-4xl font-bold">{stats?.users.total || 0}</p>
                        <p className="text-sm opacity-80 mt-2">{stats?.users.active || 0} active</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90 mb-1">Appointments</h3>
                        <p className="text-4xl font-bold">{stats?.appointments.total || 0}</p>
                        <p className="text-sm opacity-80 mt-2">{completionRate}% completion</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90 mb-1">Completion Rate</h3>
                        <p className="text-4xl font-bold">{completionRate}%</p>
                        <p className="text-sm opacity-80 mt-2">{stats?.appointments.by_status.completed || 0} completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90 mb-1">Customer/Tailor</h3>
                        <p className="text-4xl font-bold">{customerToTailorRatio}:1</p>
                        <p className="text-sm opacity-80 mt-2">ratio</p>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Appointment Trend */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appointment Trends</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="appointments"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User Distribution Pie */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Appointment Status Bar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appointment Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={appointmentStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {appointmentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Trend (Mock Data) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Summary Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.users.by_role.customer || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customers</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.users.by_role.tailor || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tailors</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.appointments.by_status.completed || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.appointments.by_status.pending || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
