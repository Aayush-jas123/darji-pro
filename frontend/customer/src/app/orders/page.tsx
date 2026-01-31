'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
    id: number;
    order_number: string;
    garment_type: string;
    status: string;
    estimated_price: number | null;
    final_price: number | null;
    estimated_delivery: string | null;
    actual_delivery: string | null;
    created_at: string;
    updated_at: string;
}

export default function CustomerOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusSteps = () => [
        { key: 'pending', label: 'Order Placed' },
        { key: 'cutting', label: 'Cutting' },
        { key: 'stitching', label: 'Stitching' },
        { key: 'finishing', label: 'Finishing' },
        { key: 'quality_check', label: 'Quality Check' },
        { key: 'ready', label: 'Ready' },
        { key: 'delivered', label: 'Delivered' },
    ];

    const getStatusIndex = (status: string) => {
        const steps = getStatusSteps();
        return steps.findIndex(s => s.key === status);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const currentStepIndex = getStatusIndex(order.status);
                            const steps = getStatusSteps();

                            return (
                                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{order.order_number}</h2>
                                            <p className="text-gray-600">{order.garment_type}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Ordered on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{order.final_price || order.estimated_price || 'TBD'}
                                            </p>
                                            {order.estimated_delivery && (
                                                <p className="text-sm text-gray-600">
                                                    Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Timeline */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between">
                                            {steps.map((step, index) => (
                                                <div key={step.key} className="flex flex-col items-center flex-1">
                                                    {/* Circle */}
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-200 text-gray-400'
                                                            }`}
                                                    >
                                                        {index < currentStepIndex ? (
                                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <span className="text-sm font-semibold">{index + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Line */}
                                                    {index < steps.length - 1 && (
                                                        <div
                                                            className={`absolute h-1 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                                                                }`}
                                                            style={{
                                                                width: `calc((100% - 40px) / ${steps.length - 1})`,
                                                                left: `calc(${(index / (steps.length - 1)) * 100}% + 20px)`,
                                                                top: '20px',
                                                            }}
                                                        />
                                                    )}

                                                    {/* Label */}
                                                    <p
                                                        className={`text-xs mt-2 text-center ${index <= currentStepIndex ? 'text-gray-900 font-medium' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {step.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Current Status */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            Current Status:{' '}
                                            <span className="font-semibold text-gray-900 capitalize">
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </p>
                                        {order.actual_delivery && (
                                            <p className="text-sm text-green-600 mt-1">
                                                Delivered on {new Date(order.actual_delivery).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 mb-4">No orders yet</p>
                        <button
                            onClick={() => router.push('/appointments/book')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Book an Appointment
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
