'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface RevenueReport {
    period_days: number;
    total_revenue: number;
    pending_revenue: number;
    paid_invoices: number;
    average_order_value: number;
}

interface TailorPerformance {
    tailor_id: number;
    tailor_name: string;
    total_orders: number;
    completed_orders: number;
    completion_rate: number;
    total_appointments: number;
}

export default function AdvancedAnalytics() {
    const router = useRouter();
    const [revenue, setRevenue] = useState<RevenueReport | null>(null);
    const [tailors, setTailors] = useState<TailorPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch revenue report
            const revenueResponse = await api.get('/api/analytics/revenue?days=30');

            if (revenueResponse.status === 200) {
                setRevenue(revenueResponse.data);
            }

            // Fetch tailor performance
            const tailorResponse = await api.get('/api/analytics/tailor-performance');

            if (tailorResponse.status === 200) {
                setTailors(tailorResponse.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Revenue Report */}
                {revenue && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Report (Last 30 Days)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">₹{revenue.total_revenue.toFixed(2)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                                <p className="text-sm font-medium text-yellow-600">Pending Revenue</p>
                                <p className="text-3xl font-bold text-yellow-900 mt-2">₹{revenue.pending_revenue.toFixed(2)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                                <p className="text-sm font-medium text-blue-600">Paid Invoices</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{revenue.paid_invoices}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                                <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">₹{revenue.average_order_value.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tailor Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tailor Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tailor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tailors.map((tailor) => (
                                    <tr key={tailor.tailor_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{tailor.tailor_name}</div>
                                            <div className="text-sm text-gray-500">ID: #{tailor.tailor_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {tailor.total_orders}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {tailor.completed_orders}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${tailor.completion_rate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{tailor.completion_rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {tailor.total_appointments}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {tailor.completion_rate >= 80 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Excellent
                                                </span>
                                            ) : tailor.completion_rate >= 60 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Good
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Needs Improvement
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {tailors.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No tailor data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
