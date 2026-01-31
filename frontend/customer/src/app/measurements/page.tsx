'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, Ruler } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface MeasurementProfile {
    id: number;
    profile_name: string;
    created_at: string;
    // Add other fields as needed based on API response
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
            const response = await api.get('/api/measurements');
            setProfiles(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">
                            Measurement Profiles
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Manage your digital measurement profiles
                        </p>
                    </div>
                    <Button onClick={() => router.push('/measurements/new')}>
                        <Plus className="w-5 h-5 mr-2" />
                        New Profile
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                        <p className="text-gray-600 mb-6">Create your first measurement profile to get started</p>
                        <Button onClick={() => router.push('/measurements/new')}>
                            Create Profile
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {profiles.map((profile) => (
                            <div key={profile.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{profile.profile_name}</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Created on {format(new Date(profile.created_at), 'PPP')}
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="w-full text-sm py-2">
                                        View Details
                                    </Button>
                                    <Button variant="secondary" className="w-full text-sm py-2">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
