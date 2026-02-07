'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LogOut,
    User,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarNav } from '@/components/SidebarNav';
import { adminNavItems } from '@/lib/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check authentication and role
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'admin') {
                // Redirect if not admin
                router.push('/dashboard');
                return;
            }
            setUser(parsedUser);
        }

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navItems = adminNavItems;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-20"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 280 : isMobile ? 0 : 80,
                    x: isMobile && !isSidebarOpen ? -280 : 0
                }}
                className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 fixed lg:relative h-full overflow-hidden whitespace-nowrap`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && !isMobile ? 'justify-center mx-auto' : ''}`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        {(isSidebarOpen || isMobile) && (
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Darji Pro
                            </span>
                        )}
                    </div>
                    {isMobile && (
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    )}
                </div>

                <SidebarNav
                    items={navItems}
                    userRole={user?.role}
                    isSidebarOpen={isSidebarOpen}
                    isMobile={isMobile}
                />

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {(isSidebarOpen || isMobile) && <span>Sign Out</span>}
                    </button>

                    {(isSidebarOpen || isMobile) && user && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                                        {user.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Admin
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
