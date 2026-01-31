'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const appointmentSchema = z.object({
    appointment_time: z.string().min(1, 'Date and time is required'),
    service_type: z.string().min(1, 'Service type is required'),
    notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function BookAppointmentPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
    });

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            // Need to format date to ISO string for backend
            const isoDate = new Date(data.appointment_time).toISOString();

            await api.post('/api/appointments', {
                ...data,
                appointment_time: isoDate,
                status: 'SCHEDULED'
            });
            router.push('/dashboard?appointment_booked=true');
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                router.push(`/login?redirect=/book-appointment`);
                return;
            }
            setError('root', {
                message: error.response?.data?.detail || 'Booking failed. Please check availability.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                        Book Appointment
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Schedule a fitting session with our expert tailors
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type
                            </label>
                            <select
                                {...register('service_type')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value="">Select a service...</option>
                                <option value="NEW_SUIT">New Suit Consultation</option>
                                <option value="MEASUREMENT">Measurement Session</option>
                                <option value="ALTERATION">Alteration</option>
                                <option value="TRIAL">Trial / Fitting</option>
                            </select>
                            {errors.service_type && (
                                <p className="mt-1 text-sm text-red-500">{errors.service_type.message}</p>
                            )}
                        </div>

                        <Input
                            label="Date & Time"
                            type="datetime-local"
                            {...register('appointment_time')}
                            error={errors.appointment_time?.message}
                        />

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                {...register('notes')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none h-32 resize-none"
                                placeholder="Any specific requirements or preferences..."
                            />
                        </div>
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex gap-4">
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
                            Confirm Booking
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
