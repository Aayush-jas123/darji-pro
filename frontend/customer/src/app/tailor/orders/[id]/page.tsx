'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Scissors,
    User,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    Truck,
    IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import api from '@/lib/api';

function OrderDetailsContent() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [order, setOrder] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch Order
            const orderRes = await api.get(`/api/orders/${id}`);
            const orderData = orderRes.data;
            setOrder(orderData);

            // 2. Fetch Customer Details
            if (orderData.customer_id) {
                try {
                    const userRes = await api.get(`/api/users/${orderData.customer_id}`);
                    setCustomer(userRes.data);
                } catch (err) {
                    console.error('Failed to fetch customer details', err);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch order', err);
            setError(err.response?.data?.detail || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Update order status to ${newStatus.replace('_', ' ')}?`)) return;

        try {
            setUpdating(true);
            await api.patch(`/api/orders/${id}`, {
                status: newStatus
            });
            fetchOrderDetails(); // Refresh
        } catch (error: any) {
            console.error('Failed to update status', error);
            alert('Failed to update status: ' + (error.response?.data?.detail || error.message));
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ready_for_trial': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'delivered': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
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

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center max-w-md w-full">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Order not found'}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button onClick={() => router.back()} variant="ghost" size="sm" className="-ml-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h1>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        {order.order_number}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Created on {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full mb-2">Update Status:</p>
                                {order.status === 'pending' && (
                                    <Button size="sm" onClick={() => handleStatusUpdate('in_progress')} isLoading={updating}>
                                        Start Work
                                    </Button>
                                )}
                                {order.status === 'in_progress' && (
                                    <Button size="sm" onClick={() => handleStatusUpdate('ready_for_trial')} isLoading={updating}>
                                        Ready for Trial
                                    </Button>
                                )}
                                {order.status === 'ready_for_trial' && (
                                    <Button size="sm" onClick={() => handleStatusUpdate('completed')} isLoading={updating}>
                                        Mark Completed
                                    </Button>
                                )}
                                {order.status === 'completed' && (
                                    <Button size="sm" onClick={() => handleStatusUpdate('delivered')} isLoading={updating} className="bg-green-600 hover:bg-green-700 text-white">
                                        Mark Delivered
                                    </Button>
                                )}
                                {(order.status !== 'cancelled' && order.status !== 'delivered') && (
                                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('cancelled')} isLoading={updating} className="text-red-600 border-red-200 hover:bg-red-50 ml-auto">
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Garment & Design Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-purple-600" />
                                Garment & Design
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Garment Type</label>
                                        <p className="text-gray-900 dark:text-white font-medium mt-1">{order.garment_type}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Price</label>
                                        <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-center">
                                            <IndianRupee className="w-4 h-4 mr-0.5" />
                                            {order.estimated_price || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fabric Details</label>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 text-sm">
                                        {order.fabric_details || 'No fabric details provided'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Design Notes</label>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 text-sm whitespace-pre-wrap">
                                        {order.design_notes || 'No design notes provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer & Info */}
                    <div className="space-y-6">
                        {/* Customer Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Customer
                            </h3>
                            {customer ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">{customer.full_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => router.push(`/tailor/measurements?customer_id=${customer.id}`)}
                                    >
                                        View Measurements
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Loading customer details...</p>
                            )}
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-green-600" />
                                Delivery
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Date</label>
                                    <p className="text-gray-900 dark:text-white font-medium mt-1">
                                        {order.estimated_delivery
                                            ? format(new Date(order.estimated_delivery), 'MMMM d, yyyy')
                                            : 'Not set'}
                                    </p>
                                </div>
                                {order.actual_delivery && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-green-600">Delivered On</label>
                                        <p className="text-green-700 font-medium mt-1">
                                            {format(new Date(order.actual_delivery), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Linked Appointment */}
                        {order.appointment_id && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    Source Appointment
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.push(`/tailor/appointments/view?id=${order.appointment_id}`)}
                                >
                                    View Appointment #{order.appointment_id}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        }>
            <OrderDetailsContent />
        </Suspense>
    );
}
