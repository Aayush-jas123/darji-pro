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
    profile_name: z.string().min(1, 'Profile name is required'),
    // Measurements (mapped to backend schema)
    chest: z.coerce.number().optional(),
    waist: z.coerce.number().optional(),
    hip: z.coerce.number().optional(),
    neck: z.coerce.number().optional(),
    shoulder: z.coerce.number().optional(),
    arm_length: z.coerce.number().optional(),
    inseam: z.coerce.number().optional(),

    // Additional fields for display/context that might not map directly to main schema
    // We'll put them in additional_measurements or ignore them if not in schema
    height: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
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
            // Construct the nested payload required by backend
            const payload = {
                profile_name: data.profile_name,
                is_default: false,
                measurements: {
                    // Map form fields to measurement version fields
                    chest: data.chest || undefined,
                    waist: data.waist || undefined,
                    hip: data.hip || undefined,
                    neck: data.neck || undefined,
                    shoulder: data.shoulder || undefined,
                    arm_length: data.arm_length || undefined,
                    inseam: data.inseam || undefined,

                    // Default values for required/enum fields
                    fit_preference: 'REGULAR',

                    // Store extra data in additional_measurements
                    additional_measurements: {
                        height: data.height,
                        weight: data.weight
                    }
                }
            };

            await api.post('/api/measurements', payload);
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
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
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
                        placeholder="e.g. My Wedding Suit"
                    />

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Height (cm)"
                                type="number"
                                step="0.1"
                                {...register('height')}
                            />
                            <Input
                                label="Weight (kg)"
                                type="number"
                                step="0.1"
                                {...register('weight')}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Body Measurements (cm)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label="Neck"
                                type="number"
                                step="0.1"
                                {...register('neck')}
                            />
                            <Input
                                label="Shoulder Width"
                                type="number"
                                step="0.1"
                                {...register('shoulder')}
                            />
                            <Input
                                label="Chest"
                                type="number"
                                step="0.1"
                                {...register('chest')}
                            />
                            <Input
                                label="Waist"
                                type="number"
                                step="0.1"
                                {...register('waist')}
                            />
                            <Input
                                label="Hips"
                                type="number"
                                step="0.1"
                                {...register('hip')}
                            />
                            <Input
                                label="Arm Length"
                                type="number"
                                step="0.1"
                                {...register('arm_length')}
                            />
                            <Input
                                label="Inseam"
                                type="number"
                                step="0.1"
                                {...register('inseam')}
                            />
                        </div>
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex gap-4 pt-6">
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
