'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Ruler, ArrowRight, User, LogOut, Info,
    ChevronRight, Sparkles, Download, Calendar, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationDropdown } from '@/components/NotificationDropdown';

interface MeasurementProfile {
    id: number;
    profile_name: string;
    created_at: string;
    updated_at?: string;
    is_default?: boolean;
    measurements?: Record<string, any>;
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
                // Mock data for dev/preview
                setTimeout(() => {
                    setProfiles([
                        {
                            id: 1,
                            profile_name: 'My Wedding Suit',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            is_default: true,
                            measurements: { fit_preference: 'Slim' }
                        },
                        {
                            id: 2,
                            profile_name: 'Casual Wear',
                            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                            updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                            measurements: { fit_preference: 'Regular' }
                        }
                    ]);
                    setLoading(false);
                }, 800);
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
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-20 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
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
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:flex"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <Ruler className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Measurement Profiles</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                            Create and manage multiple measurement profiles for different fits (e.g., Slim Fit, Comfort Fit) to ensure perfect tailoring every time.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/measurements/new')}
                        className="shadow-lg shadow-blue-600/20 bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:brightness-110 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Profile
                    </Button>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-16 text-center shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping"></div>
                            <Ruler className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No profiles found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Start your bespoke journey by creating your first measurement profile. It only takes a few minutes!
                        </p>
                        <Button onClick={() => router.push('/measurements/new')} size="lg">
                            <Plus className="w-5 h-5 mr-2" /> Create First Profile
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
                            >
                                <Card className="group h-full relative overflow-hidden border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300">
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                                    <div className="p-6 flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                                <User className="w-6 h-6" />
                                            </div>
                                            {profile.is_default && (
                                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-green-200 dark:border-green-800">
                                                    <Sparkles className="w-3 h-3" /> Default
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {profile.profile_name}
                                        </h3>

                                        <div className="space-y-2 mb-8">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>Updated {format(new Date(profile.updated_at || profile.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            {profile.measurements && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Activity className="w-4 h-4" />
                                                    <span>Fit: <span className="font-medium text-gray-700 dark:text-gray-300">{profile.measurements.fit_preference || 'Regular'}</span></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                                title="Edit Profile"
                                                onClick={() => router.push(`/measurements/edit?id=${profile.id}`)}
                                            >
                                                <Info className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                                                title="Download PDF"
                                                id={`download-${profile.id}`}
                                                onClick={() => handleDownloadPDF(profile.id, profile.profile_name)}
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <Button
                                                size="sm"
                                                className="ml-auto w-auto shadow-md shadow-blue-500/10"
                                                onClick={() => router.push(`/measurements/edit?id=${profile.id}`)}
                                            >
                                                View Details <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Resource Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: profiles.length * 0.1 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />

                                <div className="p-6 h-full flex flex-col justify-between relative z-10">
                                    <div>
                                        <div className="p-3 bg-white/20 w-fit rounded-xl backdrop-blur-md mb-6 shadow-inner">
                                            <Info className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">New to Custom Fits?</h3>
                                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                            Check out our comprehensive guide on how to take accurate body measurements at home.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold text-white/90 group-hover:text-white group-hover:gap-3 transition-all">
                                        Open Guide <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
