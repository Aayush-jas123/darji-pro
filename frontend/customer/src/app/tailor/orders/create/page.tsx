'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

function CreateOrderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointment_id = searchParams.get('appointment_id');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        garment_type: 'Suit',
        fabric_details: '',
        design_notes: '',
        estimated_price: '',
        estimated_delivery: '',
    });

    useEffect(() => {
        if (!appointment_id) {
            router.push('/tailor/appointments');
        }
    }, [appointment_id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const payload = {
                appointment_id: Number(appointment_id),
                garment_type: formData.garment_type,
                fabric_details: formData.fabric_details,
                design_notes: formData.design_notes,
                estimated_price: formData.estimated_price ? Number(formData.estimated_price) : null,
                estimated_delivery: formData.estimated_delivery ? new Date(formData.estimated_delivery).toISOString() : null,
            };

            const response = await api.post('/api/orders/', payload);
            router.push('/tailor');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow">
                <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Garment Type</label>
                        <select
                            value={formData.garment_type}
                            onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            required
                        >
                            <option value="Suit">Suit</option>
                            <option value="Shirt">Shirt</option>
                            <option value="Trousers">Trousers</option>
                            <option value="Sherwani">Sherwani</option>
                            <option value="Kurta">Kurta</option>
                            <option value="Blazer">Blazer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Details</label>
                        <textarea
                            value={formData.fabric_details}
                            onChange={(e) => setFormData({ ...formData, fabric_details: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            rows={3}
                            placeholder="Color, material, brand, code, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Design Notes</label>
                        <textarea
                            value={formData.design_notes}
                            onChange={(e) => setFormData({ ...formData, design_notes: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            rows={3}
                            placeholder="Collar style, cuff type, fit preference, etc."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Price (₹)</label>
                            <input
                                type="number"
                                value={formData.estimated_price}
                                onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                            <input
                                type="date"
                                value={formData.estimated_delivery}
                                onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={submitting} className="w-full sm:w-auto">
                            <Save className="w-4 h-4 mr-2" />
                            Create Order
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function CreateOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CreateOrderContent />
        </Suspense>
    );
}
