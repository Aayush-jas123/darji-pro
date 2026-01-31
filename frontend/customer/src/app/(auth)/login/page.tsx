'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const loginSchema = z.object({
    username: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            // Check if backend expects form data or json. 
            // The swagger says POST /api/auth/login/json takes JSON body {email, password}
            // But usually OAuth2 uses form-urlencoded. Let's check Swagger if available or assume JSON for now as per previous summary.
            // Oh, the swagger screenshot showed a Token endpoint, usually OAuth2 form request.
            // But wait, user previously used /api/auth/login/json in curl? 
            // Let's rely on JSON endpoint if available, but standard FastAPI auth uses form data.
            // I'll try the JSON endpoint usually added for convenience.

            // Wait, standard FastAPI security uses form-data. Let's try to send as x-www-form-urlencoded first if we encounter issues.
            // Actually, let's check if there is a JSON login.
            // Based on typical fastAPI setups, there might be /api/auth/login (form) and /api/auth/login/json.
            // Let's assume there is a JSON endpoint or we'll fix it. I think I saw it in earlier messages.

            // Let's look at previous messages...
            // "Login: Find POST /api/auth/login/json" -> Yes! The model suggested this earlier.

            const response = await api.post('/api/auth/login/json', {
                email: data.username, // typically mapped from username field
                password: data.password
            });

            const { access_token } = response.data;
            if (access_token) {
                localStorage.setItem('token', access_token);
                // Also store user info if available? Maybe fetch it.
                // For now, redirect to dashboard or home.
                router.push('/');
            }
        } catch (error: any) {
            console.error(error);
            setError('root', {
                message: error.response?.data?.detail || 'Invalid email or password',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-display font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your dashboard
                    </p>
                </div>

                {registered && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center">
                        Account created successfully! Please sign in.
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            {...register('username')}
                            error={errors.username?.message}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="••••••••"
                        />
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        Sign in
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
