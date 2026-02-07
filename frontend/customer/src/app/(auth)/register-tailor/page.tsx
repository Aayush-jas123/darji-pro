'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const tailorRegisterSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    experience_years: z.number().min(0, 'Experience cannot be negative').max(50, 'Please enter valid experience'),
    specialization: z.string().min(5, 'Please describe your specialization'),
    bio: z.string().optional(),
});

type TailorRegisterFormData = z.infer<typeof tailorRegisterSchema>;

export default function RegisterTailorPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<TailorRegisterFormData>({
        resolver: zodResolver(tailorRegisterSchema),
    });

    const onSubmit = async (data: TailorRegisterFormData) => {
        try {
            await api.post('/api/tailor-registration/register', {
                ...data,
                experience_years: parseInt(data.experience_years.toString()),
            });
            router.push('/register-tailor/success');
        } catch (error: any) {
            console.error(error);
            setError('root', {
                message: error.response?.data?.detail || 'Registration failed. Please try again.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white">
                        Join as a Tailor
                    </h2>
                    <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                        Apply to join Darji Pro's network of professional tailors
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                Application Process
                            </h3>
                            <div className="mt-2 text-sm text-blue-800 dark:text-blue-300 space-y-1">
                                <p>✓ Submit your application with credentials</p>
                                <p>✓ Admin reviews your profile</p>
                                <p>✓ Receive approval notification</p>
                                <p>✓ Start accepting appointments</p>
                                <p className="mt-3 text-xs italic">Applications typically reviewed within 24-48 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <Input
                                label="Full Name"
                                {...register('full_name')}
                                error={errors.full_name?.message}
                                placeholder="John Doe"
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            placeholder="john@example.com"
                        />

                        <Input
                            label="Phone Number"
                            type="tel"
                            {...register('phone')}
                            error={errors.phone?.message}
                            placeholder="+1234567890"
                        />

                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="••••••••"
                        />

                        <Input
                            label="Years of Experience"
                            type="number"
                            {...register('experience_years', { valueAsNumber: true })}
                            error={errors.experience_years?.message}
                            placeholder="5"
                            min="0"
                            max="50"
                        />

                        <div className="md:col-span-2">
                            <Input
                                label="Specialization"
                                {...register('specialization')}
                                error={errors.specialization?.message}
                                placeholder="e.g., Suits, Shirts, Traditional Wear, Alterations"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                List your areas of expertise
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bio (Optional)
                            </label>
                            <textarea
                                {...register('bio')}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Tell us about yourself, your experience, and what makes you a great tailor..."
                            />
                            {errors.bio && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                            )}
                        </div>
                    </div>

                    {errors.root && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                            <p className="text-sm text-red-800 dark:text-red-300">{errors.root.message}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-3 text-base font-semibold"
                        isLoading={isSubmitting}
                    >
                        Submit Application
                    </Button>

                    <div className="text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                                Sign in
                            </Link>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Looking to book an appointment? </span>
                            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                                Register as Customer
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
