import {
    LayoutDashboard,
    Calendar,
    Scissors,
    Ruler,
    User,
    ShoppingBag,
    Clock,
    Bell,
    Settings,
    Users,
    BarChart3,
    FileText,
    Shield,
} from 'lucide-react';
import { NavItem } from '@/components/SidebarNav';

// Customer navigation items
export const customerNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/book-appointment', label: 'Book Appointment', icon: Calendar },
    { href: '/appointments', label: 'My Appointments', icon: Clock },
    { href: '/measurements', label: 'My Measurements', icon: Ruler },
    { href: '/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'My Profile', icon: User },
];

// Tailor navigation items
export const tailorNavItems: NavItem[] = [
    { href: '/tailor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tailor/appointments', label: 'My Appointments', icon: Calendar },
    { href: '/tailor/orders', label: 'Assigned Orders', icon: Scissors },
    { href: '/tailor/measurements', label: 'Measurements', icon: Ruler },
    { href: '/tailor/availability', label: 'My Availability', icon: Clock },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/tailor/profile', label: 'My Profile', icon: User },
];

// Admin navigation items
export const adminNavItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

// Get navigation items based on role
export function getNavItemsForRole(role: string): NavItem[] {
    switch (role) {
        case 'admin':
            return adminNavItems;
        case 'tailor':
            return tailorNavItems;
        case 'customer':
            return customerNavItems;
        default:
            return customerNavItems;
    }
}
