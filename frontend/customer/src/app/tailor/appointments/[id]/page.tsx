'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Calendar,
    MapPin,
    User,
    Clock,
    Phone,
    MessageSquare,
    Ruler,
    Scissors,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

// Generate empty params for static export - actual data fetched client-side
export function generateStaticParams() {
    return [];
}

export default function AppointmentDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchAppointment();
    }, [id]);

    const fetchAppointment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch specific appointment details
            // The API might be /api/appointments/{id}
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAppointment(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = () => {
        // Navigate to order creation with pre-filled endpoint
        // For MVP, just show alert or console log if page doesn't exist
        router.push(`/tailor/orders/new?appointment_id=${id}&customer_id=${appointment?.customer_id}`);
    };

    const handleTakeMeasurements = () => {
        router.push(`/tailor/measurements/new?customer_id=${appointment?.customer_id}`);
    };

    const handleComplete = async () => {
        // Optimistic update
        if (!confirm('Mark this appointment as completed?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'completed' })
            });
            fetchAppointment();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!appointment) return <div className="p-8 text-center">Appointment not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                ← Back to List
            </Button>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {appointment.service_type}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(appointment.appointment_date), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Branch #{appointment.branch_id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'}`}>
                        {appointment.status}
                    </span>
                    <p className="text-xs text-gray-500">ID: #{appointment.id}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" /> Customer Details
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                                C
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Customer #{appointment.customer_id}</p>
                                <p className="text-sm text-gray-500">Registered Client</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Phone className="w-4 h-4" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <MessageSquare className="w-4 h-4" />
                                <span>customer@example.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h2>
                    <div className="space-y-3">
                        <Button
                            className="w-full justify-start"
                            variant="primary"
                            onClick={handleTakeMeasurements}
                        >
                            <Ruler className="w-4 h-4 mr-2" /> Take Measurements
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="secondary"
                            onClick={handleCreateOrder}
                            disabled={appointment.status !== 'confirmed'}
                        >
                            <Scissors className="w-4 h-4 mr-2" /> Create New Order
                        </Button>
                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={handleComplete}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes Section (Placeholder) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details & Requirements</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {appointment.notes || "No notes provided by customer."}
                </p>
            </div>
        </div>
    );
}
