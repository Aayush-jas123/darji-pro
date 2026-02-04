'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Ruler, ArrowRight, User } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            // Mock data for UI dev if auth missing
            if (!token) {
                const mockProfiles = [
                    { id: 1, profile_name: 'My Wedding Suit', created_at: new Date().toISOString(), is_default: true },
                    { id: 2, profile_name: 'Casual Wear', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
                    { id: 3, profile_name: 'Office Formal', created_at: new Date(Date.now() - 86400000 * 12).toISOString() }
                ];
                setProfiles(mockProfiles);
                setLoading(false);
                return;
            }

            const response = await api.get('/api/measurements');
            setProfiles(response.data);
        } catch (error: any) {
            console.error("Failed to fetch profiles", error);
            // Fallback mock
            const mockProfiles = [
                { id: 1, profile_name: 'My Wedding Suit', created_at: new Date().toISOString(), is_default: true },
            ];
            setProfiles(mockProfiles);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">Measurements</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Button onClick={() => router.push('/measurements/new')} className="hidden sm:flex shadow-md shadow-primary-500/20">
                                <Plus className="w-4 h-4 mr-2" />
                                New Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* Intro Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profiles</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage your body measurements for perfect fitting clothes.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 dark:border-primary-400"></div>
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm animate-slide-up">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ruler className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No profiles found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Create your first measurement profile to allow tailors to craft the perfect fit for you.
                        </p>
                        <Button onClick={() => router.push('/measurements/new')} className="shadow-lg shadow-primary-500/20">
                            Create First Profile
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {profiles.map((profile, i) => (
                            <div
                                key={profile.id}
                                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                                        <User className="w-6 h-6" />
                                    </div>
                                    {profile.is_default && (
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {profile.profile_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Created {format(new Date(profile.created_at), 'MMMM d, yyyy')}
                                </p>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                                        onClick={() => router.push(`/measurements/${profile.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 group/btn"
                                        onClick={() => router.push(`/measurements/${profile.id}`)}
                                    >
                                        View
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Mobile Fab */}
            <div className="fixed bottom-6 right-6 sm:hidden z-30">
                <Button
                    onClick={() => router.push('/measurements/new')}
                    className="rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg shadow-primary-500/30"
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
