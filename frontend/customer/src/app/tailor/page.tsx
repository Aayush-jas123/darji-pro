'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Scissors,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { RoleGuard } from '@/components/RoleGuard';

function TailorDashboardContent() {
    const router = useRouter();
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingOrders: 0,
        completedOrders: 0
    });
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Appointments
            const apptRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, { headers });
            const appointments = await apptRes.json();

            // Fetch Orders
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, { headers });
            const orders = await orderRes.json();

            // Process Data
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = appointments.filter((a: any) => a.appointment_date.startsWith(today));

            // Limit to 5 upcoming
            setTodaySchedule(todayAppts.slice(0, 5));

            setStats({
                todayAppointments: todayAppts.length,
                pendingOrders: orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length,
                completedOrders: orders.filter((o: any) => o.status === 'delivered').length
            });

            setRecentOrders(orders.slice(0, 5));

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Hello, {user?.full_name?.split(' ')[0] || 'Tailor'} 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Here is your daily activity summary.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">Today</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Appointments Scheduled</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Scissors className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">Active</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Orders in Progress</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Orders Delivered</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Today's Schedule */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
                        <Link href="/tailor/appointments" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">View All</Link>
                    </div>
                    <div className="p-6">
                        {todaySchedule.length > 0 ? (
                            <div className="space-y-4">
                                {todaySchedule.map((appt) => (
                                    <div key={appt.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {format(new Date(appt.appointment_date), 'h:mm a')}
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">Customer #{appt.customer_id}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{appt.service_type}</p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <span>Branch #{appt.branch_id}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize 
                                            ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Orders</h2>
                        <Link href="/tailor/orders" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">View All</Link>
                    </div>
                    <div className=" divide-y divide-gray-100 dark:divide-gray-700">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                            {order.garment_type.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{order.order_number}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.garment_type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {format(new Date(order.created_at), 'MMM d')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No active orders found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TailorDashboard() {
    return (
        <RoleGuard allowedRoles={['tailor']}>
            <TailorDashboardContent />
        </RoleGuard>
    );
}
