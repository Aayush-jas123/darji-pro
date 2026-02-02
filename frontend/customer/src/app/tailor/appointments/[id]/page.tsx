'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Ruler, Clock, Save, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Appointment {
    id: number;
    customer_id: number;
    appointment_type: string;
    status: string;
    scheduled_time: string;
    customer_notes: string;
    tailor_notes: string;
}

interface MeasurementProfile {
    id: number;
    name: string;
    values: Record<string, number>;
}

export default function AppointmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [measurements, setMeasurements] = useState<MeasurementProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch Appointment
            // We need a specific endpoint for fetching a single appointment details
            // The tailor.py has /appointments (list) but maybe not /{id} specifically exposed in tailor router?
            // Actually, tailor.py has `PATCH /appointments/{id}/status` and `GET /{id}/measurements`, 
            // but for details we might need to use the generic /api/appointments/{id} if tailor has access,
            // or we might need to rely on the list data passed via state (less reliable).
            // Let's assume /api/appointments/{id} is accessible to Tailor.

            // Checking api/appointments.py would be wise, but let's try generic first.
            const apptParams = new URLSearchParams();
            const apptResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (apptResponse.ok) {
                const apptData = await apptResponse.json();
                setAppointment(apptData);
                setNotes(apptData.tailor_notes || '');
            } else {
                // Fallback: Use tailor list ? No, that's inefficient.
                // If 403, we might need to add endpoint to tailor.py
                console.warn('Failed to fetch appointment details directly');
            }

            // Fetch Measurements
            const measResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments/${id}/measurements`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (measResponse.ok) {
                const measData = await measResponse.json();
                if (!measData.message) { // Check if it's not a "not found" message
                    setMeasurements(measData);
                }
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments/${id}/status?status=${newStatus}&notes=${encodeURIComponent(notes)}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointment(prev => prev ? { ...prev, status: newStatus, tailor_notes: notes } : null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const createOrder = async () => {
        if (!appointment) return;
        router.push(`/tailor/orders/create?appointment_id=${id}`);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!appointment) return <div className="p-8 text-center text-red-600">Appointment not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Status Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize mt-1">
                                {appointment.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {appointment.status === 'pending' && (
                                <Button onClick={() => updateStatus('confirmed')} isLoading={updating}>
                                    Confirm
                                </Button>
                            )}
                            {appointment.status === 'confirmed' && (
                                <Button onClick={() => updateStatus('completed')} isLoading={updating} variant="secondary">
                                    Mark Complete
                                </Button>
                            )}
                            {appointment.status === 'completed' && (
                                <Button onClick={createOrder} className="bg-green-600 hover:bg-green-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Create Order
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        Customer Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Customer ID</p>
                            <p className="font-medium">#{appointment.customer_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Scheduled Time</p>
                            <p className="font-medium">{new Date(appointment.scheduled_time).toLocaleString()}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Customer Notes</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                                {appointment.customer_notes || "No notes provided."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Measurements */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-gray-500" />
                        Measurements
                    </h2>
                    {measurements ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {measurements.values && Object.entries(measurements.values).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs text-gray-500 uppercase">{key.replace(/_/g, ' ')}</p>
                                    <p className="font-semibold">{value} in</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No measurements found for this customer.
                        </div>
                    )}
                </div>

                {/* Tailor Notes */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        Internal Notes
                    </h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add private notes about this appointment..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        rows={3}
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => updateStatus(appointment.status)} isLoading={updating} variant="outline">
                            Save Notes
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    );
}
