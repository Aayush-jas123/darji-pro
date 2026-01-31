'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Ruler, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentBooked = searchParams.get('appointment_booked');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check auth on client side
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        // Ideally fetch user details here
        // setUser({ name: 'User' }); 
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-display font-bold text-primary-600">Darji Pro</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={handleLogout} className="text-sm py-2 px-4">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {appointmentBooked && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Appointment booked successfully! We look forward to seeing you.
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600">Welcome to your personal tailoring hub</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Quick Action: Book Appointment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                            <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Appointments</h3>
                        <p className="text-gray-600 mb-4 min-h-[48px]">
                            Schedule fittings, view upcoming appointments, and manage your calendar.
                        </p>
                        <Link href="/book-appointment">
                            <Button className="w-full">Book Now</Button>
                        </Link>
                    </div>

                    {/* Quick Action: Measurements */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mb-4">
                            <Ruler className="w-6 h-6 text-secondary-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">My Measurements</h3>
                        <p className="text-gray-600 mb-4 min-h-[48px]">
                            Update your profile, track changes, and view AI fit recommendations.
                        </p>
                        <Link href="/measurements">
                            <Button variant="secondary" className="w-full">Manage Profile</Button>
                        </Link>
                    </div>

                    {/* Profile & Settings (Placeholder) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">My Account</h3>
                        <p className="text-gray-600 mb-4 min-h-[48px]">
                            Update your personal details, password, and preferences.
                        </p>
                        <Button variant="outline" className="w-full">Edit Profile</Button>
                    </div>
                </div>

                {/* Recent Activity Section (Placeholder) */}
                <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        No recent activity to show.
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
