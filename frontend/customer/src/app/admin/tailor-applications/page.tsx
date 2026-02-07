'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface TailorApplication {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    experience_years: number;
    specialization: string;
    bio?: string;
    account_status: string;
    created_at: string;
    approved_at?: string;
    approval_notes?: string;
}

export default function TailorApplicationsPage() {
    const [applications, setApplications] = useState<TailorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [selectedApplication, setSelectedApplication] = useState<TailorApplication | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const statusFilter = activeTab === 'approved' ? 'approved' : activeTab;
            const response = await api.get(`/api/tailor-registration/applications?status_filter=${statusFilter}`);
            setApplications(response.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedApplication || !actionType) return;

        try {
            setProcessing(true);
            const endpoint = `/api/tailor-registration/applications/${selectedApplication.id}/${actionType}`;
            await api.post(endpoint, { notes });

            // Refresh list
            await fetchApplications();

            // Close modal
            setShowModal(false);
            setSelectedApplication(null);
            setNotes('');
            setActionType(null);
        } catch (error: any) {
            console.error(`Failed to ${actionType} application:`, error);
            alert(error.response?.data?.detail || `Failed to ${actionType} application`);
        } finally {
            setProcessing(false);
        }
    };

    const openActionModal = (application: TailorApplication, type: 'approve' | 'reject') => {
        setSelectedApplication(application);
        setActionType(type);
        setShowModal(true);
        setNotes('');
    };

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tailor Applications
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Review and manage tailor registration applications
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm capitalize
                                    ${activeTab === tab
                                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }
                                `}
                            >
                                {tab}
                                {!loading && applications.length > 0 && (
                                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                                        {applications.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            No {activeTab} applications found
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {application.full_name}
                                            </h3>
                                            <span className={`
                                                px-2 py-1 text-xs font-medium rounded-full
                                                ${application.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                ${application.account_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                ${application.account_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                            `}>
                                                {application.account_status}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                <p className="text-gray-900 dark:text-white">{application.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                                <p className="text-gray-900 dark:text-white">{application.phone}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                                                <p className="text-gray-900 dark:text-white">{application.experience_years} years</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Applied:</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(application.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">Specialization:</span>
                                            <p className="text-gray-900 dark:text-white mt-1">{application.specialization}</p>
                                        </div>

                                        {application.bio && (
                                            <div className="mt-3">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Bio:</span>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{application.bio}</p>
                                            </div>
                                        )}

                                        {application.approval_notes && (
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Admin Notes:</span>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{application.approval_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {application.account_status === 'pending' && (
                                        <div className="ml-6 flex flex-col gap-2">
                                            <Button
                                                onClick={() => openActionModal(application, 'approve')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => openActionModal(application, 'reject')}
                                                variant="outline"
                                                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Modal */}
                {showModal && selectedApplication && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Application
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {actionType === 'approve'
                                    ? `Are you sure you want to approve ${selectedApplication.full_name}'s application?`
                                    : `Are you sure you want to reject ${selectedApplication.full_name}'s application?`
                                }
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes {actionType === 'reject' && '(Required)'}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder={actionType === 'approve' ? 'Optional welcome message...' : 'Please provide a reason for rejection...'}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleAction}
                                    isLoading={processing}
                                    disabled={actionType === 'reject' && !notes.trim()}
                                    className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                >
                                    Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedApplication(null);
                                        setNotes('');
                                        setActionType(null);
                                    }}
                                    variant="outline"
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
