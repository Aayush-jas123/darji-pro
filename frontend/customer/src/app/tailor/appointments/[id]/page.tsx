'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Required for static export
export function generateStaticParams() {
    return [];
}

interface Appointment {
    id: number;
    customer_id: number;
    scheduled_time: string;
    service_type: string;
    status: string;
    notes: string | null;
}

interface Measurements {
    id: number;
    profile_name: string;
    height: number | null;
    weight: number | null;
    chest: number | null;
    waist: number | null;
    hips: number | null;
    shoulder_width: number | null;
    sleeve_length: number | null;
    inseam: number | null;
    neck: number | null;
    fit_preference: string | null;
    notes: string | null;
}

export default function AppointmentDetails() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [measurements, setMeasurements] = useState<Measurements | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, [appointmentId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch appointment details
            const apptResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments?limit=100`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (apptResponse.ok) {
                const appointments = await apptResponse.json();
                const appt = appointments.find((a: Appointment) => a.id === parseInt(appointmentId));
                if (appt) {
                    setAppointment(appt);
                    setNewStatus(appt.status);
                    setNewNotes(appt.notes || '');
                }
            }

            // Fetch measurements
            const measResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments/${appointmentId}/measurements`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (measResponse.ok) {
                const measData = await measResponse.json();
                if (measData.id) {
                    setMeasurements(measData);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tailor/appointments/${appointmentId}/status?status=${newStatus}&notes=${encodeURIComponent(newNotes)}`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (response.ok) {
                alert('Status updated successfully!');
                fetchData();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Appointment not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Appointment #{appointment.id}</h1>
                        <button
                            onClick={() => router.push('/tailor')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Appointment Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Service Type</label>
                                <p className="text-gray-900">{appointment.service_type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                                <p className="text-gray-900">{new Date(appointment.scheduled_time).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Customer ID</label>
                                <p className="text-gray-900">#{appointment.customer_id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Current Status</label>
                                <p className="text-gray-900 capitalize">{appointment.status.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Add notes..."
                                />
                            </div>
                            <button
                                onClick={updateStatus}
                                disabled={updating}
                                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer Measurements */}
                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Measurements</h2>
                    {measurements ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {measurements.height && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Height</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.height} cm</p>
                                </div>
                            )}
                            {measurements.weight && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Weight</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.weight} kg</p>
                                </div>
                            )}
                            {measurements.chest && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Chest</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.chest} cm</p>
                                </div>
                            )}
                            {measurements.waist && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Waist</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.waist} cm</p>
                                </div>
                            )}
                            {measurements.hips && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Hips</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.hips} cm</p>
                                </div>
                            )}
                            {measurements.shoulder_width && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Shoulder Width</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.shoulder_width} cm</p>
                                </div>
                            )}
                            {measurements.sleeve_length && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Sleeve Length</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.sleeve_length} cm</p>
                                </div>
                            )}
                            {measurements.inseam && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Inseam</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.inseam} cm</p>
                                </div>
                            )}
                            {measurements.neck && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Neck</label>
                                    <p className="text-lg font-semibold text-gray-900">{measurements.neck} cm</p>
                                </div>
                            )}
                            {measurements.fit_preference && (
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Fit Preference</label>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{measurements.fit_preference}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">No measurements available for this customer</p>
                    )}
                </div>
            </main>
        </div>
    );
}
