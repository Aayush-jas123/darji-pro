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

const registerSchema = z.object({
    full_name: z.string().min(2, 'Name needs to be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['customer', 'tailor', 'admin']).default('customer'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'customer',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            // Always register as customer for public registration
            await api.post('/api/auth/register', {
                ...data,
                role: 'customer',
            });
            router.push('/login?registered=true');
        } catch (error: any) {
            console.error(error);
            setError('root', {
                message: error.response?.data?.detail || 'Registration failed. Please try again.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-display font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Darji Pro for a perfect fit experience
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            {...register('full_name')}
                            error={errors.full_name?.message}
                            placeholder="John Doe"
                        />
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

                        {/* Role Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Registering as Customer
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            Public registration is for <strong>customer accounts</strong> only.
                                            You'll be able to book appointments, manage measurements, and track orders.
                                        </p>
                                        <p className="mt-2">
                                            <strong>Need a Tailor or Admin account?</strong><br />
                                            Please contact an administrator to create your account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        Sign up
                    </Button>

                    <div className="text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-600">Already have an account? </span>
                            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Sign in
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Are you a tailor? </span>
                            <Link href="/register-tailor" className="font-medium text-primary-600 hover:text-primary-500">
                                Register as Tailor
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
