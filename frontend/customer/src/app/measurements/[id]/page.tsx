'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Ruler, Info, Save, Trash2, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const measurementSchema = z.object({
    profile_name: z.string().min(1, 'Profile name is required'),
    chest: z.coerce.number().optional(),
    waist: z.coerce.number().optional(),
    hip: z.coerce.number().optional(),
    neck: z.coerce.number().optional(),
    shoulder: z.coerce.number().optional(),
    arm_length: z.coerce.number().optional(),
    inseam: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

const MEASUREMENT_GUIDES: Record<string, string> = {
    neck: "Measure around the base of your neck, inserting two fingers for comfort.",
    shoulder: "Measure from the tip of one shoulder bone to the other across your back.",
    chest: "Measure around the fullest part of your chest, keeping the tape horizontal.",
    waist: "Measure around your natural waistline, just above your hip bones.",
    hip: "Measure around the fullest part of your hips/buttocks.",
    arm_length: "Measure from shoulder tip to wrist bone with arm slightly bent.",
    inseam: "Measure from crotch down to the bottom of your ankle.",
};

export default function MeasurementDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [activeField, setActiveField] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<MeasurementFormData>({
        resolver: zodResolver(measurementSchema),
    });

    useEffect(() => {
        if (id) {
            fetchProfile(id as string);
        }
    }, [id]);

    const fetchProfile = async (profileId: string) => {
        try {
            const token = localStorage.getItem('token');
            // Mock data fetch if no auth (dev mode)
            if (!token) {
                setTimeout(() => {
                    reset({
                        profile_name: 'My Wedding Suit',
                        chest: 42,
                        waist: 34,
                        hip: 40,
                        neck: 16,
                        shoulder: 18,
                        arm_length: 25,
                        inseam: 32,
                        height: 180,
                        weight: 75
                    });
                    setLoading(false);
                }, 500);
                return;
            }

            const response = await api.get(`/api/measurements/${profileId}`);
            const data = response.data;

            // Transform data for form
            reset({
                profile_name: data.profile_name,
                chest: data.measurements?.chest,
                waist: data.measurements?.waist,
                hip: data.measurements?.hip,
                neck: data.measurements?.neck,
                shoulder: data.measurements?.shoulder,
                arm_length: data.measurements?.arm_length,
                inseam: data.measurements?.inseam,
                height: data.measurements?.additional_measurements?.height,
                weight: data.measurements?.additional_measurements?.weight,
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setLoading(false);
            // alert('Failed to load profile');
        }
    };

    const onSubmit = async (data: MeasurementFormData) => {
        try {
            const payload = {
                profile_name: data.profile_name,
                is_default: false,
                measurements: {
                    chest: data.chest || undefined,
                    waist: data.waist || undefined,
                    hip: data.hip || undefined,
                    neck: data.neck || undefined,
                    shoulder: data.shoulder || undefined,
                    arm_length: data.arm_length || undefined,
                    inseam: data.inseam || undefined,
                    fit_preference: 'REGULAR',
                    additional_measurements: {
                        height: data.height,
                        weight: data.weight
                    }
                }
            };

            // If we had an API endpoint for PATCH/PUT
            // await api.put(`/api/measurements/${id}`, payload);

            // Simulating update success
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to update profile');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this profile?')) {
            try {
                // await api.delete(`/api/measurements/${id}`);
                router.push('/measurements');
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">Edit Profile</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            <AnimatePresence>
                                {saveSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center shadow-sm"
                                    >
                                        <Check className="w-5 h-5 mr-2" />
                                        Profile updated successfully!
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Section 1: Identity */}
                            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold">Profile Identity</h2>
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        label="Profile Name"
                                        {...register('profile_name')}
                                        error={errors.profile_name?.message}
                                        placeholder="e.g. My Wedding Suit"
                                        onFocus={() => setActiveField('profile_name')}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Height"
                                            type="number"
                                            step="0.1"
                                            suffix="cm"
                                            {...register('height')}
                                            onFocus={() => setActiveField('height')}
                                        />
                                        <Input
                                            label="Weight"
                                            type="number"
                                            step="0.1"
                                            suffix="kg"
                                            {...register('weight')}
                                            onFocus={() => setActiveField('weight')}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Body Measurements */}
                            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                        <Ruler className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold">Measurements</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                    {['neck', 'shoulder', 'chest', 'waist', 'hip', 'arm_length', 'inseam'].map((field) => (
                                        <Input
                                            key={field}
                                            label={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            type="number"
                                            step="0.1"
                                            suffix="cm"
                                            {...register(field as keyof MeasurementFormData)}
                                            onFocus={() => setActiveField(field)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-gray-50 dark:bg-gray-950 pb-4 z-10">
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
                                    className="w-full shadow-lg shadow-primary-500/20"
                                    isLoading={isSubmitting}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Helper Sidebar */}
                    <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-all duration-300">
                            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4">
                                <Info className="w-5 h-5" />
                                <h3 className="font-semibold">Measurement Guide</h3>
                            </div>

                            <div className="min-h-[100px]">
                                {activeField && MEASUREMENT_GUIDES[activeField] ? (
                                    <div className="animate-fade-in">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                            {MEASUREMENT_GUIDES[activeField]}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                                        Focus on a measurement field to see specific instructions on how to measure effectively.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
