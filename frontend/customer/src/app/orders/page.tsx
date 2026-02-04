'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, Package, Truck, CheckCircle,
    Calendar, IndianRupee, ChevronRight, AlertCircle,
    Info, Clock, Scissors, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

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

const ORDER_STEPS = [
    { key: 'pending', label: 'Placed', icon: ShoppingBag },
    { key: 'cutting', label: 'Cutting', icon: Scissors },
    { key: 'stitching', label: 'Stitching', icon: Scissors }, // Reuse icon or find specific
    { key: 'finishing', label: 'Finishing', icon: CheckCircle },
    { key: 'quality_check', label: 'QC', icon: Search },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'delivered', label: 'Delivered', icon: Truck },
];

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
                // Mock data
                setTimeout(() => {
                    setOrders([
                        {
                            id: 1,
                            order_number: 'ORD-2024-001',
                            garment_type: 'Three Piece Suit',
                            status: 'stitching',
                            estimated_price: 15000,
                            final_price: null,
                            estimated_delivery: new Date(Date.now() + 86400000 * 5).toISOString(),
                            actual_delivery: null,
                            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                            updated_at: new Date().toISOString()
                        },
                        {
                            id: 2,
                            order_number: 'ORD-2023-089',
                            garment_type: 'Formal Shirt',
                            status: 'delivered',
                            estimated_price: 2500,
                            final_price: 2500,
                            estimated_delivery: new Date(Date.now() - 86400000 * 10).toISOString(),
                            actual_delivery: new Date(Date.now() - 86400000 * 12).toISOString(),
                            created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]);
                    setLoading(false);
                }, 800);
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

    const getStatusIndex = (status: string) => {
        return ORDER_STEPS.findIndex(s => s.key === status.toLowerCase());
    };

    const getStatusColor = (status: string) => {
        const index = getStatusIndex(status);
        if (status === 'delivered') return 'text-green-600 dark:text-green-400';
        if (index > 0) return 'text-blue-600 dark:text-blue-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Orders</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Track the progress of your bespoke garments</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        Back to Dashboard
                    </Button>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        [1, 2].map(i => (
                            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-64 rounded-2xl animate-pulse" />
                        ))
                    ) : orders.length > 0 ? (
                        <AnimatePresence>
                            {orders.map((order, i) => {
                                const activeIndex = getStatusIndex(order.status);

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-6 md:p-8">
                                            {/* Order Header */}
                                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{order.garment_type}</h2>
                                                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                                            #{order.order_number}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Ordered on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center md:justify-end gap-1">
                                                        <IndianRupee className="w-5 h-5" />
                                                        {(order.final_price || order.estimated_price || 0).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center md:justify-end gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {order.actual_delivery ? 'Delivered: ' : 'Est. Delivery: '}
                                                        {format(new Date(order.actual_delivery || order.estimated_delivery || new Date()), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Tracker */}
                                            <div className="relative mt-8 mb-4">
                                                {/* Desktop Steps */}
                                                <div className="hidden md:flex justify-between relative z-10">
                                                    {ORDER_STEPS.map((step, index) => {
                                                        const isActive = index <= activeIndex;
                                                        const isCompleted = index < activeIndex;
                                                        const isCurrent = index === activeIndex;

                                                        return (
                                                            <div key={step.key} className="flex flex-col items-center flex-1">
                                                                <div
                                                                    className={`
                                                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-800
                                                                        ${isActive
                                                                            ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
                                                                            : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                                                                        }
                                                                        ${isCurrent ? 'ring-4 ring-blue-100 dark:ring-blue-900/40 scale-110' : ''}
                                                                        ${isCompleted ? 'bg-blue-600 dark:bg-blue-500 !text-white !border-blue-600 dark:!border-blue-500' : ''}
                                                                    `}
                                                                >
                                                                    <step.icon className="w-5 h-5" />
                                                                </div>
                                                                <p className={`
                                                                    text-xs mt-3 font-medium transition-colors
                                                                    ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
                                                                `}>
                                                                    {step.label}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Connector Line Background */}
                                                <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-0" />

                                                {/* Connector Line Active */}
                                                <div
                                                    className="hidden md:block absolute top-5 left-0 h-0.5 bg-blue-600 dark:bg-blue-500 transition-all duration-500 -z-0"
                                                    style={{ width: `${(activeIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
                                                />

                                                {/* Mobile Steps (Vertical or simplified) */}
                                                <div className="md:hidden flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <info className="w-5 h-5" /> {/* Use current step icon */}
                                                        {(() => {
                                                            const CurrentIcon = ORDER_STEPS[activeIndex]?.icon || Info;
                                                            return <CurrentIcon className="w-5 h-5" />;
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px] font-bold">Current Status</p>
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg capitalize">
                                                            {order.status.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details / Action */}
                                            {/* <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </div> */}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active orders</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                You haven't placed any orders yet. Book an appointment to get started with your bespoke journey.
                            </p>
                            <Button onClick={() => router.push('/book-appointment')}>
                                Start New Order
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
