'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Invoice {
    id: number;
    invoice_number: string;
    order_id: number;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    status: string;
    payment_method: string | null;
    issue_date: string;
    due_date: string | null;
    payment_date: string | null;
}

export default function CustomerInvoices() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await api.get('/api/invoices');

            if (response.status === 200) {
                setInvoices(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            partially_paid: 'bg-blue-100 text-blue-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                        <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {invoices.length > 0 ? (
                    <div className="space-y-6">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{invoice.invoice_number}</h2>
                                        <p className="text-sm text-gray-500">
                                            Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                        {invoice.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Subtotal</p>
                                        <p className="text-lg font-semibold text-gray-900">₹{invoice.subtotal.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tax</p>
                                        <p className="text-lg font-semibold text-gray-900">₹{invoice.tax_amount.toFixed(2)}</p>
                                    </div>
                                    {invoice.discount_amount > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600">Discount</p>
                                            <p className="text-lg font-semibold text-green-600">-₹{invoice.discount_amount.toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{invoice.total_amount.toFixed(2)}</p>
                                    </div>
                                </div>

                                {invoice.paid_amount > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Paid Amount</p>
                                                <p className="text-lg font-semibold text-green-600">₹{invoice.paid_amount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Balance</p>
                                                <p className="text-lg font-semibold text-red-600">
                                                    ₹{(invoice.total_amount - invoice.paid_amount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        {invoice.payment_date && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Payment received on {new Date(invoice.payment_date).toLocaleDateString()}
                                                {invoice.payment_method && ` via ${invoice.payment_method}`}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {invoice.due_date && invoice.status !== 'paid' && (
                                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No invoices found</p>
                    </div>
                )}
            </main>
        </div>
    );
}
