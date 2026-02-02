'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AvailabilitySetting {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

export default function AvailabilityPage() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<AvailabilitySetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tailor/availability`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Merge with defaults if some days are missing
                const mergedSchedule = DAYS.map(day => {
                    const existing = data.find((d: any) => d.day_of_week === day.key);
                    return existing || {
                        day_of_week: day.key,
                        start_time: '09:00',
                        end_time: '17:00',
                        is_active: false // Default to inactive if not set
                    };
                });
                setSchedule(mergedSchedule);
            } else {
                throw new Error('Failed to fetch availability');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tailor/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(schedule),
            });

            if (response.ok) {
                setSuccess('Schedule updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to update schedule');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateDay = (index: number, field: keyof AvailabilitySetting, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Intro Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Weekly Schedule</h2>
                            <p className="text-gray-600">
                                Set your standard working hours for each day of the week. Customers will only be able to book appointments during these times.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* Schedule Grid */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {schedule.map((day, index) => {
                            const dayLabel = DAYS.find(d => d.key === day.day_of_week)?.label || day.day_of_week;

                            return (
                                <div key={day.day_of_week} className={`p-6 transition-colors ${day.is_active ? 'bg-white' : 'bg-gray-50'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">

                                        {/* Day Toggle */}
                                        <div className="flex items-center min-w-[140px]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={day.is_active}
                                                    onChange={(e) => updateDay(index, 'is_active', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                <span className={`ml-3 text-sm font-medium ${day.is_active ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                                                    {dayLabel}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Times */}
                                        <div className={`flex items-center gap-4 flex-1 ${!day.is_active && 'opacity-40 pointer-events-none'}`}>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={day.start_time ? day.start_time.substring(0, 5) : ''}
                                                    onChange={(e) => updateDay(index, 'start_time', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                            <span className="text-gray-400 mt-5">-</span>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    value={day.end_time ? day.end_time.substring(0, 5) : ''}
                                                    onChange={(e) => updateDay(index, 'end_time', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="sm:w-24 text-right">
                                            {day.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Open
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sticky Save Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
                    <div className="max-w-4xl mx-auto flex justify-end gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={handleSave}
                            isLoading={saving}
                            className="w-32"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
