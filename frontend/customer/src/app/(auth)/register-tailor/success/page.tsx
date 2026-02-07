'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function RegisterTailorSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
                        <svg className="h-16 w-16 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                        Application Submitted!
                    </h2>
                    <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                        Thank you for applying to join Darji Pro as a tailor.
                    </p>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-left">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                        What happens next?
                    </h3>
                    <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-3">
                                1
                            </span>
                            <span>Our team will review your application and credentials</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-3">
                                2
                            </span>
                            <span>You'll receive an email notification (usually within 24-48 hours)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-3">
                                3
                            </span>
                            <span>Once approved, you can log in and start accepting appointments</span>
                        </li>
                    </ol>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            <strong>Important:</strong> Please do not attempt to log in until you receive approval confirmation.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link href="/" className="block">
                        <Button className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                            Go to Login
                        </Button>
                    </Link>
                </div>

                {/* Contact */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Questions? Contact us at{' '}
                    <a href="mailto:support@darjipro.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                        support@darjipro.com
                    </a>
                </p>
            </div>
        </div>
    );
}
