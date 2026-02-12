'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Ruler, Scissors, Shirt, CheckCircle, MessageCircle,
    Calendar as CalendarIcon, User, ChevronRight, ChevronLeft, ArrowRight, Clock
} from 'lucide-react';
import api from '@/lib/api';
import { StepIndicator } from '@/components/StepIndicator';
import { BookingCalendar } from '@/components/BookingCalendar';
import { TimeSlotSelector } from '@/components/TimeSlotSelector';

// Types
interface Branch {
    id: number;
    name: string;
    address: string;
    city: string;
}

interface Tailor {
    id: number;
    name: string;
}

interface BookingState {
    step: number;
    branch: Branch | null;
    service: string | null;
    tailor: Tailor | null;
    date: Date | null;
    time: string | null;
    notes: string;
}

const STEPS = [
    { id: 1, label: 'Branch' },
    { id: 2, label: 'Service' },
    { id: 3, label: 'Date & Time' },
    { id: 4, label: 'Confirm' }
];

const SERVICES = [
    { id: 'consultation', label: 'New Suit Consultation', icon: Shirt, desc: 'Full consultation for a bespoke suit' },
    { id: 'measurement', label: 'Measurement Session', icon: Ruler, desc: 'Get your precise measurements taken' },
    { id: 'alteration', label: 'Alteration', icon: Scissors, desc: 'Adjustments to existing garments' },
    { id: 'fitting', label: 'Fitting / Trial', icon: CheckCircle, desc: 'Try on your garment in progress' },
    { id: 'consultation', label: 'General Consultation', icon: MessageCircle, desc: 'Discuss fabrics and styles' }
];

export default function BookAppointmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState({
        branches: true,
        tailors: false,
        submit: false
    });
    const [branches, setBranches] = useState<Branch[]>([]);
    const [tailors, setTailors] = useState<Tailor[]>([]);

    const [state, setState] = useState<BookingState>({
        step: 1,
        branch: null,
        service: null,
        tailor: null,
        date: null,
        time: null,
        notes: ''
    });

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login?redirect=/book-appointment');
            return;
        }
        fetchBranches();
    }, []);

    useEffect(() => {
        if (state.branch) {
            fetchTailors(state.branch.id);
        }
    }, [state.branch]);

    const fetchBranches = async () => {
        try {
            const response = await api.get('/api/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        } finally {
            setLoading(prev => ({ ...prev, branches: false }));
        }
    };

    const fetchTailors = async (branchId: number) => {
        setLoading(prev => ({ ...prev, tailors: true }));
        try {
            const response = await api.get(`/api/branches/${branchId}/availability`);

            // Extract unique tailors from availability
            const uniqueTailors = new Map<number, string>();
            response.data.forEach((slot: any) => {
                if (slot.tailor_id) {
                    uniqueTailors.set(slot.tailor_id, slot.tailor_name || `Tailor #${slot.tailor_id}`);
                }
            });

            // If no tailors found from availability, try to fetch all staff for branch (fallback)
            // This is a simplification. In real app we might have a dedicated endpoint.
            const tailorsList = Array.from(uniqueTailors.entries()).map(([id, name]) => ({ id, name }));
            setTailors(tailorsList);
        } catch (error) {
            console.error('Failed to fetch tailors', error);
        } finally {
            setLoading(prev => ({ ...prev, tailors: false }));
        }
    };

    const handleNext = () => {
        if (state.step < 4) {
            setState(prev => ({ ...prev, step: prev.step + 1 }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (state.step > 1) {
            setState(prev => ({ ...prev, step: prev.step - 1 }));
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!state.date || !state.time || !state.branch || !state.service || !state.tailor) return;

        setLoading(prev => ({ ...prev, submit: true }));
        try {
            // Combine date and time
            const [hours, minutes] = state.time.split(':').map(Number);
            const appointmentDate = new Date(state.date);
            appointmentDate.setHours(hours, minutes, 0, 0);

            // Format as local datetime string (YYYY-MM-DDTHH:mm:ss) without timezone
            // Database expects TIMESTAMP WITHOUT TIME ZONE
            const year = appointmentDate.getFullYear();
            const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
            const day = String(appointmentDate.getDate()).padStart(2, '0');
            const hour = String(appointmentDate.getHours()).padStart(2, '0');
            const minute = String(appointmentDate.getMinutes()).padStart(2, '0');
            const second = String(appointmentDate.getSeconds()).padStart(2, '0');
            const localDateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

            await api.post('/api/appointments', {
                branch_id: state.branch.id,
                tailor_id: state.tailor.id,
                appointment_type: state.service,
                scheduled_date: localDateTime,
                duration_minutes: 30,
                customer_notes: state.notes || undefined
            });

            // Redirect on success
            router.push('/dashboard?appointment_booked=true');
        } catch (error: any) {
            console.error('Booking failed', error);
            if (error.response?.status === 401) {
                router.push(`/login?redirect=/book-appointment`);
            } else {
                // Handle error message properly
                let errorMessage = 'Failed to book appointment. Please try again.';
                if (error.response?.data?.detail) {
                    const detail = error.response.data.detail;
                    errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
                }
                alert(errorMessage);
            }
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    // Validation for Next button
    const isStepValid = () => {
        switch (state.step) {
            case 1: return !!state.branch;
            case 2: return !!state.service && !!state.tailor;
            case 3: return !!state.date && !!state.time;
            case 4: return true;
            default: return false;
        }
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((branch) => (
                <div
                    key={branch.id}
                    onClick={() => setState(prev => ({ ...prev, branch }))}
                    className={`
                        cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
                        ${state.branch?.id === branch.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-transparent bg-white dark:bg-gray-800 hover:border-blue-300 shadow-sm hover:shadow-md'
                        }
                    `}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`
                                p-3 rounded-lg flex items-center justify-center
                                ${state.branch?.id === branch.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}
                            `}>
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{branch.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{branch.city}</p>
                            </div>
                        </div>
                        {state.branch?.id === branch.id && (
                            <div className="bg-blue-600 rounded-full p-1 animate-in zoom-in duration-200">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{branch.address}</p>
                </div>
            ))}
            {loading.branches && (
                [1, 2].map(i => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-purple-600" /> Select Service
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {SERVICES.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => setState(prev => ({ ...prev, service: service.id }))}
                            className={`
                                cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                                ${state.service === service.id
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                                    : 'border-transparent bg-white dark:bg-gray-800 hover:border-purple-300 shadow-sm'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <service.icon className={`w-8 h-8 ${state.service === service.id ? 'text-purple-600' : 'text-gray-400'}`} />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{service.label}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{service.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Select Tailor
                </h3>
                {tailors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {tailors.map((tailor) => (
                            <div
                                key={tailor.id}
                                onClick={() => setState(prev => ({ ...prev, tailor }))}
                                className={`
                                    cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3
                                    ${state.tailor?.id === tailor.id
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                        : 'border-transparent bg-white dark:bg-gray-800 hover:border-blue-300 shadow-sm'
                                    }
                                `}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{tailor.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-200 text-center">
                        {loading.tailors ? 'Loading tailors...' : 'No tailors available for this branch. Please try another branch.'}
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" /> Select Date
                </h3>
                <BookingCalendar
                    selectedDate={state.date}
                    onDateSelect={(date) => setState(prev => ({ ...prev, date, time: null }))}
                />
            </div>
            <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" /> Select Time
                </h3>
                {!state.date ? (
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 text-sm">Please select a date first</p>
                    </div>
                ) : (
                    <TimeSlotSelector
                        tailorId={state.tailor!.id}
                        selectedTime={state.time}
                        onTimeSelect={(time) => setState(prev => ({ ...prev, time }))}
                    />
                )}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Booking Summary</h3>

                <div className="space-y-4">
                    <SummaryItem
                        icon={MapPin} label="Branch"
                        value={state.branch?.name}
                        subValue={state.branch?.address}
                        onEdit={() => setState(prev => ({ ...prev, step: 1 }))}
                    />
                    <SummaryItem
                        icon={Scissors} label="Service"
                        value={SERVICES.find(s => s.id === state.service)?.label}
                        onEdit={() => setState(prev => ({ ...prev, step: 2 }))}
                    />
                    <SummaryItem
                        icon={User} label="Tailor"
                        value={state.tailor?.name}
                        onEdit={() => setState(prev => ({ ...prev, step: 2 }))}
                    />
                    <SummaryItem
                        icon={CalendarIcon} label="Date & Time"
                        value={state.date?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        subValue={state.time ? `${state.time}` : ''}
                        onEdit={() => setState(prev => ({ ...prev, step: 3 }))}
                    />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={state.notes}
                        onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any specific instructions or preferences..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-shadow"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                        Book Appointment
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Schedule a session with our expert tailors in just a few simple steps.
                    </p>
                </div>

                <StepIndicator steps={STEPS} currentStep={state.step} />

                <div className="mt-8 mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state.step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {state.step === 1 && renderStep1()}
                            {state.step === 2 && renderStep2()}
                            {state.step === 3 && renderStep3()}
                            {state.step === 4 && renderStep4()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {state.step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!isStepValid() || loading.submit}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform
                            ${isStepValid() && !loading.submit
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95'
                                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70'}
                        `}
                    >
                        {loading.submit ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : state.step === 4 ? (
                            <>Confirm Booking <CheckCircle className="w-5 h-5" /></>
                        ) : (
                            <>Next Step <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Summary
const SummaryItem = ({ icon: Icon, label, value, subValue, onEdit }: any) => (
    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg group">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                {subValue && <p className="text-sm text-gray-500 mt-0.5">{subValue}</p>}
            </div>
        </div>
        <button
            onClick={onEdit}
            className="text-gray-400 group-hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
        >
            <span className="text-sm font-medium">Edit</span>
        </button>
    </div>
);


