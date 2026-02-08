'use client';

import React, { useState } from 'react';
import { Save, Globe, Shield, Bell, Moon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Mock Settings State
    const [settings, setSettings] = useState({
        siteName: 'Darji Pro',
        supportEmail: 'support@darjipro.com',
        maintenanceMode: false,
        debugMode: false,
        emailNotifications: true,
        smsNotifications: false,
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your application configuration</p>
                </div>
                <Button onClick={handleSave} isLoading={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            {isSaved && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center"
                >
                    <Shield className="w-5 h-5 mr-3" />
                    Settings saved successfully!
                </motion.div>
            )}

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle>General Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                            <Input
                                label="Support Email"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* System Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle>System & Security</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Disable access for non-admin users</p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Debug Mode</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Show detailed error logs (Performance impact)</p>
                            </div>
                            <Switch
                                checked={settings.debugMode}
                                onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send system alerts via email</p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send urgent alerts via SMS</p>
                            </div>
                            <Switch
                                checked={settings.smsNotifications}
                                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
