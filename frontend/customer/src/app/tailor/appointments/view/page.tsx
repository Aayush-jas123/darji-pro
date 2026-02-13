'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calendar,
    Clock,
    User,
    Scissors,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import api from '@/lib/api';

function AppointmentDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [appointment, setAppointment] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch Appointment
            const apptRes = await api.get(`/api/appointments/${id}`);
            const apptData = apptRes.data;
            setAppointment(apptData);

            // 2. Fetch Customer Details
            if (apptData.customer_id) {
                try {
                    const userRes = await api.get(`/api/users/${apptData.customer_id}`);
                    setCustomer(userRes.data);
                } catch (err) {
                    console.error('Failed to fetch customer details', err);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch appointment', err);
            setError(err.response?.data?.detail || 'Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) return;

        try {
            setUpdating(true);
            await api.patch(`/api/appointments/${id}/status`, {
                status: newStatus
            });
            fetchDetails(); // Refresh
        } catch (error: any) {
            console.error('Failed to update status', error);
            alert('Failed to update status: ' + (error.response?.data?.detail || error.message));
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center max-w-md w-full">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Appointment</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Appointment not found'}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button onClick={() => router.back()} variant="ghost" size="sm" className="-ml-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Details</h1>
                </div>

                {/* Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/50">
                                <span className="text-xl">
                                    {new Date(appointment.scheduled_date).getDate()}
                                </span>
                                <span className="text-xs uppercase">
                                    {new Date(appointment.scheduled_date).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {appointment.appointment_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {format(new Date(appointment.scheduled_date), 'h:mm a')} ({appointment.duration_minutes} min)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        Branch #{appointment.branch_id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            {appointment.status === 'confirmed' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate('completed')}
                                    isLoading={updating}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                </Button>
                            )}
                            {appointment.status === 'pending' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate('confirmed')}
                                    isLoading={updating}
                                >
                                    Confirm
                                </Button>
                            )}
                            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    isLoading={updating}
                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Details</h3>
                        </div>

                        {customer ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{customer.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
                                    <div className="space-y-1 mt-1">
                                        {customer.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Mail className="w-4 h-4" /> {customer.email}
                                            </div>
                                        )}
                                        {customer.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Phone className="w-4 h-4" /> {customer.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => router.push(`/tailor/measurements?customer_id=${customer.id}`)}
                                    >
                                        <Scissors className="w-4 h-4 mr-2" /> View Measurements
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">Customer details unavailable</div>
                        )}
                    </div>

                    {/* Notes & Actions */}
                    <div className="space-y-6">
                        {/* Notes */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notes</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Notes</label>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 text-sm italic">
                                        {appointment.customer_notes || 'No notes provided'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tailor Notes</label>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 text-sm">
                                        {appointment.tailor_notes || 'No internal notes'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Action */}
                        <Button
                            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-200 dark:shadow-none"
                            onClick={() => router.push(`/tailor/orders/create?appointment_id=${id}`)}
                        >
                            <Scissors className="w-5 h-5 mr-2" /> Create Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AppointmentDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        }>
            <AppointmentDetailsContent />
        </Suspense>
    );
}
