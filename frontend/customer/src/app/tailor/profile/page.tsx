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

export default function TailorProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
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
        <RoleGuard allowedRoles={["tailor"]}>
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
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
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
