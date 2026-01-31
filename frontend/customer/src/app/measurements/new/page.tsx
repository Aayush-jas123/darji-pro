'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const measurementSchema = z.object({
    profile_name: z.string().min(1, 'Profile name is required (e.g. "My Wedding Suit")'),
    height: z.coerce.number().min(1, 'Height is required'),
    weight: z.coerce.number().min(1, 'Weight is required'),
    // Add other measurements as needed, keeping it simple for now
    chest: z.coerce.number().optional(),
    waist: z.coerce.number().optional(),
    hips: z.coerce.number().optional(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

export default function NewMeasurementPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<MeasurementFormData>({
        resolver: zodResolver(measurementSchema),
    });

    const onSubmit = async (data: MeasurementFormData) => {
        try {
            await api.post('/api/measurements', {
                ...data,
                unit: 'CM' // Default unit
            });
            router.push('/measurements');
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                router.push('/login?redirect=/measurements/new');
                return;
            }
            setError('root', {
                message: error.response?.data?.detail || 'Failed to save profile.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                        New Measurement Profile
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Create a new profile for your custom fit
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Profile Name"
                        {...register('profile_name')}
                        error={errors.profile_name?.message}
                        placeholder="e.g. Traditional Kurta Fit"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Height (cm)"
                            type="number"
                            step="0.1"
                            {...register('height')}
                            error={errors.height?.message}
                        />
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            {...register('weight')}
                            error={errors.weight?.message}
                        />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-medium text-gray-900 mb-4">Body Measurements (Optional)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="Chest (cm)"
                                type="number"
                                step="0.1"
                                {...register('chest')}
                            />
                            <Input
                                label="Waist (cm)"
                                type="number"
                                step="0.1"
                                {...register('waist')}
                            />
                            <Input
                                label="Hips (cm)"
                                type="number"
                                step="0.1"
                                {...register('hips')}
                            />
                        </div>
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            Save Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
