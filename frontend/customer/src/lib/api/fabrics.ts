/**
 * Fabric API Client
 * Handles all fabric-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Fabric {
    id: number;
    name: string;
    type: string;
    color?: string;
    pattern?: string;
    price_per_meter: number;
    image_url?: string;
    description?: string;
    in_stock: boolean;
    created_at: string;
    updated_at: string;
}

export interface FabricFilters {
    type?: string;
    color?: string;
    pattern?: string;
    search?: string;
    in_stock?: boolean;
    skip?: number;
    limit?: number;
}

/**
 * Fetch all fabrics with optional filters
 */
export async function getFabrics(filters?: FabricFilters): Promise<Fabric[]> {
    try {
        const params = new URLSearchParams();

        if (filters?.type) params.append('type', filters.type);
        if (filters?.color) params.append('color', filters.color);
        if (filters?.pattern) params.append('pattern', filters.pattern);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.in_stock !== undefined) params.append('in_stock', String(filters.in_stock));
        if (filters?.skip) params.append('skip', String(filters.skip));
        if (filters?.limit) params.append('limit', String(filters.limit));

        const response = await axios.get(`${API_BASE_URL}/api/fabrics?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching fabrics:', error);
        throw error;
    }
}

/**
 * Get unique fabric types for filtering
 */
export async function getFabricTypes(): Promise<string[]> {
    try {
        const fabrics = await getFabrics();
        const types = [...new Set(fabrics.map(f => f.type))];
        return types.sort();
    } catch (error) {
        console.error('Error fetching fabric types:', error);
        return [];
    }
}

/**
 * Get unique fabric colors for filtering
 */
export async function getFabricColors(): Promise<string[]> {
    try {
        const fabrics = await getFabrics();
        const colors = [...new Set(fabrics.map(f => f.color).filter(Boolean))];
        return colors.sort();
    } catch (error) {
        console.error('Error fetching fabric colors:', error);
        return [];
    }
}

/**
 * Get unique fabric patterns for filtering
 */
export async function getFabricPatterns(): Promise<string[]> {
    try {
        const fabrics = await getFabrics();
        const patterns = [...new Set(fabrics.map(f => f.pattern).filter(Boolean))];
        return patterns.sort();
    } catch (error) {
        console.error('Error fetching fabric patterns:', error);
        return [];
    }
}
