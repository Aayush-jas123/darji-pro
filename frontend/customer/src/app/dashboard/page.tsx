'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, Ruler, LogOut, User, ShoppingBag,
    Clock, ChevronRight, Plus, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import api from '@/lib/api';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentBooked = searchParams.get('appointment_booked');
    const [user, setUser] = useState<any>(null);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user profile and recent appointments
        Promise.all([
            fetchProfile(),
            fetchAppointments()
        ]).finally(() => setLoading(false));
    }, [router]);

    const fetchProfile = async () => {
        try {
            // Need a dedicated profile endpoint, or parse token?
            // Assuming /api/users/me exists or similar. 
            // Fallback: use a placeholder or partial data if endpoint missing
            // For now, let's assume we can get name from localStorage or just show generic
            const storedUser = localStorage.getItem('user'); // if we stored it
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch (e) { console.error(e); }
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/appointments');
            setAppointments(res.data.slice(0, 3)); // Top 3 recent
        } catch (e) {
            console.error('Failed to load appointments', e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                            DP
                        </div>
                        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">Darji Pro</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <NotificationBell onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} />
                            <NotificationDropdown
                                isOpen={notificationDropdownOpen}
                                onClose={() => setNotificationDropdownOpen(false)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {appointmentBooked && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl mb-8 flex items-center shadow-sm"
                    >
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mr-4">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold">Appointment Booked Successfully!</p>
                            <p className="text-sm opacity-90">We've sent a confirmation email with all the details.</p>
                        </div>
                    </motion.div>
                )}

                {/* Welcome Section */}
                <div className="mb-10">
                    <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Manage your bespoke tailoring journey all in one place.
                    </p>
                </div>

                {/* Stats / Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Link href="/appointments" className="block group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">Upcoming</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{appointments.filter(a => a.status !== 'COMPLETED').length}</h3>
                                <p className="text-blue-100 text-sm">Active Appointments</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/measurements" className="block group">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Ruler className="w-6 h-6" />
                                    </div>
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">Profile</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">Complete</h3>
                                <p className="text-purple-100 text-sm">Measurement Status</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/orders" className="block group">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">Orders</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">0</h3>
                                <p className="text-indigo-100 text-sm">Active Orders</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Actions & Activity - Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link href="/book-appointment" className="group">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Book Appointment</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule a new fitting or consultation session</p>
                                    </div>
                                </Link>

                                <Link href="/measurements" className="group">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                                <Ruler className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">My Measurements</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Update your size profile and preferences</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Appointments</h3>
                                <Link href="/appointments" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                    View All
                                </Link>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent mx-auto mb-4" />
                                        <p className="text-gray-500 text-sm">Loading activity...</p>
                                    </div>
                                ) : appointments.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {appointments.map((apt) => (
                                            <div key={apt.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl h-fit">
                                                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                                {apt.appointment_type.replace('_', ' ')}
                                                            </h4>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {new Date(apt.scheduled_date).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    Tailor #{apt.tailor_id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`
                                                        px-3 py-1 rounded-full text-xs font-semibold
                                                        ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                            apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
                                                    `}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h4 className="text-gray-900 dark:text-white font-medium mb-1">No appointments yet</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Book your first session to get started</p>
                                        <Link href="/book-appointment">
                                            <Button size="sm">Book Now</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-8">
                        {/* Marketing / Feature Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Premium Fabrics</h3>
                                <p className="text-gray-300 text-sm mb-6">
                                    Explore our new collection of Italian wools and silk blends for your next suit.
                                </p>
                                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 dark:hover:bg-white/10">
                                    View Catalog
                                </Button>
                            </div>
                        </div>

                        {/* Recent Support/Help */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                Have questions about your measurements or upcoming appointment?
                            </p>
                            <Button variant="ghost" className="w-full justify-start text-blue-600 dark:text-blue-400 p-0 hover:bg-transparent hover:underline">
                                Contact Support →
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
