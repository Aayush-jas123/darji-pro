'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
    redirectTo?: string;
}

export function RoleGuard({ allowedRoles, children, redirectTo }: RoleGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            console.log('RoleGuard - Checking access:', { token: token ? 'present' : 'missing', userRole, allowedRoles });

            // No token - redirect to login
            if (!token) {
                console.log('RoleGuard - No token, redirecting to login');
                router.push('/login');
                return;
            }

            // No role - something went wrong, redirect to login
            if (!userRole) {
                console.log('RoleGuard - No role found, redirecting to login');
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }

            // Check if user's role is allowed
            if (!allowedRoles.includes(userRole)) {
                console.log('RoleGuard - Access denied, redirecting based on role');

                // If custom redirect specified, use it
                if (redirectTo) {
                    router.push(redirectTo);
                    return;
                }

                // Otherwise redirect to user's appropriate dashboard
                if (userRole === 'admin') {
                    router.push('/admin');
                } else if (userRole === 'tailor') {
                    router.push('/tailor');
                } else {
                    router.push('/dashboard');
                }
                return;
            }

            // User is authorized
            console.log('RoleGuard - Access granted');
            setAuthorized(true);
            setChecking(false);
        };

        checkAccess();
    }, [router, allowedRoles, redirectTo]);

    // Show loading state while checking
    if (checking) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if authorized
    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
