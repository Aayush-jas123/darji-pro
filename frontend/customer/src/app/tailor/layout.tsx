'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Scissors,
    Ruler,
    LogOut,
    User,
    Menu,
    X,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TailorLayout({ children }: { children: React.ReactNode }) {
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
            if (parsedUser.role !== 'tailor' && parsedUser.role !== 'admin') {
                // Redirect if not tailor (allow admin for testing)
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

    const navItems = [
        { href: '/tailor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tailor/appointments', label: 'My Appointments', icon: Calendar },
        { href: '/tailor/orders', label: 'Assigned Orders', icon: Scissors },
        { href: '/tailor/measurements', label: 'Measurements', icon: Ruler },
        { href: '/tailor/profile', label: 'My Profile', icon: User },
    ];

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
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                            <Scissors className="w-5 h-5 text-white" />
                        </div>
                        {(isSidebarOpen || isMobile) && (
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
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

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/tailor' && pathname?.startsWith(item.href));
                        return (
                            <Link href={item.href} key={item.href}>
                                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}>
                                    <item.icon className="w-5 h-5 shrink-0" />
                                    {(isSidebarOpen || isMobile) && <span>{item.label}</span>}
                                </div>
                            </Link>
                        );
                    })}
                </div>

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
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                                        {user.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Tailor
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
