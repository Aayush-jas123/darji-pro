"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { RoleGuard } from '@/components/RoleGuard';

interface User {
    id: number;
    email: string;
    phone: string;
    full_name: string;
    role: string;
    created_at: string;
    last_login: string | null;
}

interface ProfileUpdateData {
    full_name: string;
    phone: string;
}

interface PasswordChangeData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

interface Stats {
    total_appointments: number;
    total_orders: number;
    total_measurements: number;
}

export default function CustomerProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [profileData, setProfileData] = useState<ProfileUpdateData>({
        full_name: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/me');
            setUser(response.data);
            setProfileData({
                full_name: response.data.full_name,
                phone: response.data.phone || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [appointmentsRes, ordersRes, measurementsRes] = await Promise.all([
                api.get('/api/appointments').catch(() => ({ data: [] })),
                api.get('/api/orders').catch(() => ({ data: [] })),
                api.get('/api/measurements').catch(() => ({ data: [] })),
            ]);

            setStats({
                total_appointments: appointmentsRes.data.length || 0,
                total_orders: ordersRes.data.length || 0,
                total_measurements: measurementsRes.data.length || 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put('/api/users/me', profileData);
            setUser(response.data);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to update profile'
            });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.new_password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        try {
            await api.put('/api/users/me/password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });
            setChangingPassword(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Failed to change password:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to change password'
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <RoleGuard allowedRoles={["customer"]}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your personal information and settings</p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Quick Stats */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Appointments</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_appointments}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Measurement Profiles</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_measurements}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setProfileData({
                                                full_name: user?.full_name || '',
                                                phone: user?.phone || '',
                                            });
                                        }}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="mt-1 text-lg text-gray-900">{user?.full_name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Email</label>
                                    <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                                    <p className="mt-1 text-lg text-gray-900">{user?.phone || 'Not provided'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Role</label>
                                    <p className="mt-1">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {user?.role.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Member Since</span>
                                <span className="text-gray-900 font-medium">{formatDate(user?.created_at || '')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Login</span>
                                <span className="text-gray-900 font-medium">{formatDate(user?.last_login || null)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/book-appointment')}
                                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                            >
                                <h3 className="font-semibold text-gray-900 mb-1">Book Appointment</h3>
                                <p className="text-sm text-gray-600">Schedule a new fitting session</p>
                            </button>

                            <button
                                onClick={() => router.push('/measurements')}
                                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                            >
                                <h3 className="font-semibold text-gray-900 mb-1">My Measurements</h3>
                                <p className="text-sm text-gray-600">View and manage your profiles</p>
                            </button>

                            <button
                                onClick={() => router.push('/orders')}
                                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
                            >
                                <h3 className="font-semibold text-gray-900 mb-1">My Orders</h3>
                                <p className="text-sm text-gray-600">Track your current orders</p>
                            </button>

                            <button
                                onClick={() => router.push('/appointments')}
                                className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-left"
                            >
                                <h3 className="font-semibold text-gray-900 mb-1">My Appointments</h3>
                                <p className="text-sm text-gray-600">View appointment history</p>
                            </button>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                            {!changingPassword && (
                                <button
                                    onClick={() => setChangingPassword(true)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {changingPassword ? (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                        minLength={8}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChangingPassword(false);
                                            setPasswordData({
                                                current_password: '',
                                                new_password: '',
                                                confirm_password: '',
                                            });
                                        }}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-gray-600">
                                Keep your account secure by using a strong password and changing it regularly.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </RoleGuard>
    );
}
