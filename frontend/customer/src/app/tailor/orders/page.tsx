'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag,
    Search,
    Filter,
    ChevronRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import api from '@/lib/api';

export default function TailorOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.order_number.toLowerCase().includes(lowerTerm) ||
                o.garment_type.toLowerCase().includes(lowerTerm) ||
                String(o.customer_id).includes(lowerTerm)
            );
        }

        setFilteredOrders(filtered);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-700';
            case 'cutting': return 'bg-blue-100 text-blue-700';
            case 'stitching': return 'bg-indigo-100 text-indigo-700';
            case 'finishing': return 'bg-purple-100 text-purple-700';
            case 'ready': return 'bg-green-100 text-green-700';
            case 'delivered': return 'bg-green-500 text-white';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Orders</h1>
                <Button onClick={() => fetchOrders()} size="sm" variant="outline">
                    Refresh List
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order # or Garment..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Stages</option>
                        <option value="pending">Pending</option>
                        <option value="cutting">Cutting</option>
                        <option value="stitching">Stitching</option>
                        <option value="finishing">Finishing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Current Stage</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.garment_type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 dark:text-white font-medium">Customer #{order.customer_id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                                <Clock className="w-3 h-3" />
                                                <span>Due: {order.estimated_delivery ? format(new Date(order.estimated_delivery), 'MMM d') : 'TBH'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/tailor/orders/${order.id}`)}
                                                className="flex items-center gap-2"
                                            >
                                                Manage <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                            <p>No orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
