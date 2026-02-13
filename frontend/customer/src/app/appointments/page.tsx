'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar, Clock, MapPin, User, Scissors,
    Filter, ChevronRight, XCircle, AlertCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface Appointment {
    id: number;
    scheduled_date: string;
    status: string;
    appointment_type: string;
    tailor_id: number;
    branch_id: number;
    customer_notes?: string;
    duration_minutes: number;
}

const TABS = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'history', label: 'History' },
    { id: 'cancelled', label: 'Cancelled' }
];

export default function AppointmentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/appointments');
            // Backend returns { appointments: [], total: ... } but we need just the array
            setAppointments(res.data.appointments || res.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setCancellingId(id);
        try {
            await api.post(`/api/appointments/${id}/cancel`, {
                cancellation_reason: 'Cancelled by user'
            });
            // Refresh list
            fetchAppointments();
        } catch (error) {
            console.error('Failed to cancel', error);
            alert('Failed to cancel appointment');
        } finally {
            setCancellingId(null);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const isCancelled = apt.status === 'CANCELLED';
        const isCompleted = apt.status === 'COMPLETED';
        const isPast = new Date(apt.scheduled_date) < new Date() && !isCancelled && !isCompleted;

        switch (activeTab) {
            case 'upcoming':
                return !isCancelled && !isCompleted && new Date(apt.scheduled_date) >= new Date();
            case 'history':
                return isCompleted || isPast;
            case 'cancelled':
                return isCancelled;
            default:
                return true;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">my Appointments</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your fittings and consultations</p>
                    </div>
                    <Button onClick={() => router.push('/book-appointment')} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Book New
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm mb-8 w-fit border border-gray-100 dark:border-gray-700">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredAppointments.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredAppointments.map((apt) => (
                                <motion.div
                                    key={apt.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/50">
                                                    <span className="text-xl">
                                                        {new Date(apt.scheduled_date).getDate()}
                                                    </span>
                                                    <span className="text-xs uppercase">
                                                        {new Date(apt.scheduled_date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {apt.appointment_type.replace('_', ' ')}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        {new Date(apt.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration_minutes} mins)
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        Tailor #{apt.tailor_id}
                                                    </div>
                                                    {apt.customer_notes && (
                                                        <div className="flex items-start gap-2 text-gray-500 italic mt-2">
                                                            <span className="sr-only">Notes:</span>
                                                            "{apt.customer_notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:self-center">
                                            {activeTab === 'upcoming' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancel(apt.id)}
                                                    isLoading={cancellingId === apt.id}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have any {activeTab} appointments.</p>
                            {activeTab === 'upcoming' && (
                                <Button onClick={() => router.push('/book-appointment')}>
                                    Book Your First Appointment
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
