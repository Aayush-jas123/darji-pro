"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    roles?: string[]; // If specified, only show for these roles
}

interface SidebarNavProps {
    items: NavItem[];
    userRole?: string;
    isSidebarOpen: boolean;
    isMobile: boolean;
}

export function SidebarNav({ items, userRole, isSidebarOpen, isMobile }: SidebarNavProps) {
    const pathname = usePathname();

    // Filter items based on user role
    const visibleItems = items.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        const rolesArray = Array.isArray(item.roles) ? item.roles : [item.roles];
        return userRole && rolesArray.includes(userRole);
    });

    return (
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
            {visibleItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link href={item.href} key={item.href}>
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}>
                            <Icon className="w-5 h-5 shrink-0" />
                            {(isSidebarOpen || isMobile) && <span>{item.label}</span>}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
