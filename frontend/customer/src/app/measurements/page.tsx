'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Ruler, ArrowRight, User, LogOut, Info,
    ChevronRight, Sparkles, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationDropdown } from '@/components/NotificationDropdown';

interface MeasurementProfile {
    id: number;
    profile_name: string;
    created_at: string;
    is_default?: boolean;
}

export default function MeasurementsPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Mock data
                setTimeout(() => {
                    setProfiles([
                        { id: 1, profile_name: 'My Wedding Suit', created_at: new Date().toISOString(), is_default: true },
                        { id: 2, profile_name: 'Casual Wear', created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
                    ]);
                    setLoading(false);
                }, 500);
                return;
            }

            const response = await api.get('/api/measurements');
            setProfiles(response.data);
        } catch (error) {
            console.error("Failed to fetch profiles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (profileId: number, profileName: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to download PDF');
                return;
            }

            // Show loading state
            const button = document.getElementById(`download-${profileId}`);
            if (button) {
                button.innerHTML = 'Downloading...';
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/measurements/${profileId}/export-pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `measurement_${profileName.replace(/\s+/g, '_')}_${profileId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Reset button
            if (button) {
                button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Download PDF';
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Header (Consistent with Dashboard) */}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Measurement Profiles</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your unique body measurements for different fits</p>
                    </div>
                    <Button onClick={() => router.push('/measurements/new')} className="shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-purple-600 border-none">
                        <Plus className="w-5 h-5 mr-2" />
                        New Profile
                    </Button>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ruler className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No profiles yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Create your first measurement profile to help our tailors craft the perfect fit.
                        </p>
                        <Button onClick={() => router.push('/measurements/new')}>
                            Create Profile
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {profiles.map((profile, i) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Hover Gradient Effect */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                        <User className="w-6 h-6" />
                                    </div>
                                    {profile.is_default && (
                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Default
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {profile.profile_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                                    Created on {format(new Date(profile.created_at), 'MMM d, yyyy')}
                                </p>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        id={`download-${profile.id}`}
                                        className="flex-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                        onClick={() => handleDownloadPDF(profile.id, profile.profile_name)}
                                    >
                                        <Download className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        className="flex-1 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                                        onClick={() => router.push(`/measurements/${profile.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group/btn"
                                        onClick={() => router.push(`/measurements/${profile.id}`)}
                                    >
                                        View
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Visual Guide Resource Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: profiles.length * 0.1 }}
                            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="p-3 bg-white/20 w-fit rounded-xl backdrop-blur-sm mb-4">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Measurement Guide</h3>
                                    <p className="text-indigo-100 text-sm mb-4">
                                        Unsure how to take measurements? View our visual guide for step-by-step instructions.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 font-semibold">
                                    View Guide <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
