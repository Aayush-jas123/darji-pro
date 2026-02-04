'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFabrics, getFabricTypes, getFabricColors, type Fabric } from '@/lib/api/fabrics';

export default function FabricCatalog() {
    const router = useRouter();
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState('All');
    const [colorFilter, setColorFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);

    // Available filter options
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableColors, setAvailableColors] = useState<string[]>([]);

    // Selected fabrics
    const [selected, setSelected] = useState<number[]>([]);

    // Fetch fabrics on mount
    useEffect(() => {
        loadFabrics();
        loadFilterOptions();
    }, []);

    // Apply filters whenever they change
    useEffect(() => {
        applyFilters();
    }, [fabrics, typeFilter, colorFilter, searchQuery, showInStockOnly, priceRange]);

    const loadFabrics = async () => {
        try {
            setLoading(true);
            const data = await getFabrics();
            setFabrics(data);
            setError(null);
        } catch (err) {
            setError('Failed to load fabrics. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadFilterOptions = async () => {
        try {
            const types = await getFabricTypes();
            const colors = await getFabricColors();
            setAvailableTypes(types);
            setAvailableColors(colors);
        } catch (err) {
            console.error('Failed to load filter options:', err);
        }
    };

    const applyFilters = () => {
        let filtered = [...fabrics];

        // Type filter
        if (typeFilter !== 'All') {
            filtered = filtered.filter(f => f.type === typeFilter);
        }

        // Color filter
        if (colorFilter !== 'All') {
            filtered = filtered.filter(f => f.color === colorFilter);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.name.toLowerCase().includes(query) ||
                f.description?.toLowerCase().includes(query) ||
                f.type.toLowerCase().includes(query)
            );
        }

        // Stock filter
        if (showInStockOnly) {
            filtered = filtered.filter(f => f.in_stock);
        }

        // Price range filter
        filtered = filtered.filter(f =>
            f.price_per_meter >= priceRange[0] && f.price_per_meter <= priceRange[1]
        );

        setFilteredFabrics(filtered);
    };

    const toggleSelection = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setTypeFilter('All');
        setColorFilter('All');
        setSearchQuery('');
        setShowInStockOnly(false);
        setPriceRange([0, 3000]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading fabrics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={loadFabrics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fabric Catalog</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {filteredFabrics.length} fabric{filteredFabrics.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search fabrics by name, type, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="space-y-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fabric Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setTypeFilter('All')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${typeFilter === 'All'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    All
                                </button>
                                {availableTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${typeFilter === type
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setColorFilter('All')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${colorFilter === 'All'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    All Colors
                                </button>
                                {availableColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setColorFilter(color)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${colorFilter === color
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Filters */}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showInStockOnly}
                                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
                            </label>

                            <button
                                onClick={resetFilters}
                                className="ml-auto px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fabric Grid */}
                {filteredFabrics.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No fabrics found matching your filters.</p>
                        <button
                            onClick={resetFilters}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFabrics.map(fabric => (
                            <div
                                key={fabric.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${selected.includes(fabric.id) ? 'ring-4 ring-blue-500' : ''
                                    } ${!fabric.in_stock ? 'opacity-60' : ''}`}
                                onClick={() => toggleSelection(fabric.id)}
                            >
                                {/* Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center relative">
                                    <span className="text-6xl">🧵</span>
                                    {!fabric.in_stock && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            Out of Stock
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{fabric.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{fabric.type}</span>
                                                {fabric.color && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{fabric.color}</span>
                                                    </>
                                                )}
                                                {fabric.pattern && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{fabric.pattern}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {selected.includes(fabric.id) && (
                                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>

                                    {fabric.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {fabric.description}
                                        </p>
                                    )}

                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ₹{fabric.price_per_meter}
                                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/meter</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selection Counter */}
                {selected.length > 0 && (
                    <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <span className="font-medium">
                            {selected.length} fabric{selected.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => setSelected([])}
                            className="text-white hover:text-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
