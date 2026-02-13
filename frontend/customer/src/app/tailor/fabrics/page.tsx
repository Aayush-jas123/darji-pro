'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getFabrics,
    createFabric,
    deleteFabric,
    getFabricTypes,
    getFabricColors,
    getFabricPatterns,
    type Fabric
} from '@/lib/api/fabrics';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, Edit2, Search, Filter } from 'lucide-react';

export default function TailorFabricsPage() {
    const router = useRouter();
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Fabric>>({
        name: '',
        type: '',
        color: '',
        pattern: '',
        price_per_meter: 0,
        description: '',
        in_stock: true,
        image_url: ''
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFabrics();
    }, []);

    const loadFabrics = async () => {
        try {
            setLoading(true);
            const data = await getFabrics();
            setFabrics(data);
        } catch (err) {
            setError('Failed to load fabrics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this fabric?')) return;

        try {
            await deleteFabric(id);
            setFabrics(fabrics.filter(f => f.id !== id));
        } catch (err) {
            alert('Failed to delete fabric');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const newFabric = await createFabric(formData);
            setFabrics([newFabric, ...fabrics]);
            setShowAddModal(false);
            setFormData({
                name: '',
                type: '',
                color: '',
                pattern: '',
                price_per_meter: 0,
                description: '',
                in_stock: true,
                image_url: ''
            });
        } catch (err) {
            alert('Failed to create fabric');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUploaded = (files: any[]) => {
        if (files.length > 0) {
            setFormData({ ...formData, image_url: files[0].url });
        }
    };

    const filteredFabrics = fabrics.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fabric Inventory</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your fabric catalog</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Fabric
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search fabrics..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFabrics.map(fabric => (
                    <div key={fabric.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                            {fabric.image_url ? (
                                <img src={fabric.image_url} alt={fabric.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleDelete(fabric.id)}
                                    className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{fabric.name}</h3>
                                    <p className="text-sm text-gray-500">{fabric.type} • {fabric.color}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${fabric.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {fabric.in_stock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{fabric.price_per_meter}<span className="text-xs font-normal text-gray-500">/m</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Fabric"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            label="Fabric Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Italian Wool"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Type"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                placeholder="e.g. Cotton, Silk"
                            />
                        </div>
                        <div>
                            <Input
                                label="Color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="e.g. Navy Blue"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Pattern"
                                value={formData.pattern}
                                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                                placeholder="e.g. Solid, Striped"
                            />
                        </div>
                        <div>
                            <Input
                                label="Price per Meter (₹)"
                                type="number"
                                required
                                min="0"
                                value={formData.price_per_meter}
                                onChange={(e) => setFormData({ ...formData, price_per_meter: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fabric Image</label>
                        <FileUpload
                            uploadType="fabric"
                            maxFiles={1}
                            onUploadComplete={handleImageUploaded}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="inStock"
                            checked={formData.in_stock}
                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="inStock" className="text-sm font-medium">In Stock</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Fabric'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
