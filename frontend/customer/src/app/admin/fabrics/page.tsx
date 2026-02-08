'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MoreVertical, Check, X as XIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getFabrics, createFabric, updateFabric, deleteFabric, type Fabric } from '@/lib/api/fabrics';

export default function AdminFabricsPage() {
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
    const [formData, setFormData] = useState<Partial<Fabric>>({});
    const [formLoading, setFormLoading] = useState(false);

    // Load Fabrics
    useEffect(() => {
        loadFabrics();
    }, []);

    const loadFabrics = async () => {
        try {
            setLoading(true);
            const data = await getFabrics();
            setFabrics(data);
        } catch (error) {
            console.error('Failed to load fabrics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
    const handleOpenModal = (fabric?: Fabric) => {
        if (fabric) {
            setEditingFabric(fabric);
            setFormData(fabric);
        } else {
            setEditingFabric(null);
            setFormData({
                name: '',
                type: 'Cotton',
                price_per_meter: 0,
                in_stock: true,
                description: '',
                color: '',
                pattern: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFabric(null);
        setFormData({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (editingFabric) {
                await updateFabric(editingFabric.id, formData);
            } else {
                await createFabric(formData);
            }
            await loadFabrics();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save fabric:', error);
            alert('Failed to save fabric. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this fabric?')) return;

        try {
            await deleteFabric(id);
            await loadFabrics();
        } catch (error) {
            console.error('Failed to delete fabric:', error);
            alert('Failed to delete fabric.');
        }
    };

    // Filter Fabrics
    const filteredFabrics = fabrics.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fabricTypes = ['Cotton', 'Wool', 'Silk', 'Linen', 'Polyester', 'Blend', 'Other'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fabric Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Add, edit, and manage fabric inventory</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Fabric
                </Button>
            </div>

            <Card>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search fabrics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Price/m</th>
                                <th className="px-6 py-4 font-semibold">Details</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">Loading...</td>
                                </tr>
                            ) : filteredFabrics.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">No fabrics found</td>
                                </tr>
                            ) : (
                                filteredFabrics.map((fabric) => (
                                    <tr key={fabric.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {fabric.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                                {fabric.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                            ₹{fabric.price_per_meter}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {fabric.color && <span>Color: {fabric.color}</span>}
                                                {fabric.pattern && <span>Pattern: {fabric.pattern}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {fabric.in_stock ? (
                                                <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                                                    <Check className="w-3 h-3 mr-1" /> In Stock
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-red-500 dark:text-red-400 text-xs font-medium">
                                                    <XIcon className="w-3 h-3 mr-1" /> Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(fabric)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fabric.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingFabric ? 'Edit Fabric' : 'Add New Fabric'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 is-required">
                            Fabric Type
                        </label>
                        <select
                            value={formData.type || 'Cotton'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                        >
                            {fabricTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price per Meter (₹)"
                            type="number"
                            value={formData.price_per_meter || 0}
                            onChange={(e) => setFormData({ ...formData, price_per_meter: Number(e.target.value) })}
                            required
                            min="0"
                        />
                        <div className="flex items-center pt-8">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.in_stock ?? true}
                                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">In Stock</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Color"
                            value={formData.color || ''}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                        <Input
                            label="Pattern"
                            value={formData.pattern || ''}
                            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={formLoading}>
                            {editingFabric ? 'Save Changes' : 'Create Fabric'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
