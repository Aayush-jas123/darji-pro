'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fabrics = [
    { id: 1, name: 'Cotton', type: 'Natural', price: 500, image: '/fabrics/cotton.jpg' },
    { id: 2, name: 'Silk', type: 'Natural', price: 1500, image: '/fabrics/silk.jpg' },
    { id: 3, name: 'Wool', type: 'Natural', price: 1200, image: '/fabrics/wool.jpg' },
    { id: 4, name: 'Linen', type: 'Natural', price: 800, image: '/fabrics/linen.jpg' },
    { id: 5, name: 'Polyester', type: 'Synthetic', price: 400, image: '/fabrics/polyester.jpg' },
    { id: 6, name: 'Velvet', type: 'Luxury', price: 2000, image: '/fabrics/velvet.jpg' },
];

export default function FabricCatalog() {
    const router = useRouter();
    const [filter, setFilter] = useState('All');
    const [selected, setSelected] = useState<number[]>([]);

    const filteredFabrics = filter === 'All'
        ? fabrics
        : fabrics.filter(f => f.type === filter);

    const toggleSelection = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Fabric Catalog</h1>
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
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex gap-4">
                        {['All', 'Natural', 'Synthetic', 'Luxury'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-lg ${filter === type
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fabric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFabrics.map(fabric => (
                        <div
                            key={fabric.id}
                            className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all ${selected.includes(fabric.id) ? 'ring-4 ring-blue-500' : ''
                                }`}
                            onClick={() => toggleSelection(fabric.id)}
                        >
                            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <span className="text-4xl text-gray-500">🧵</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{fabric.name}</h3>
                                        <p className="text-sm text-gray-600">{fabric.type}</p>
                                    </div>
                                    {selected.includes(fabric.id) && (
                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-xl font-bold text-gray-900">₹{fabric.price}/meter</p>
                            </div>
                        </div>
                    ))}
                </div>

                {selected.length > 0 && (
                    <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                        {selected.length} fabric{selected.length > 1 ? 's' : ''} selected
                    </div>
                )}
            </main>
        </div>
    );
}
