import React, { useState } from 'react';
import { Settings, Palette, Bell, RefreshCw, User, Monitor } from 'lucide-react';
import { useTheme, ThemeToggle } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
    const { theme } = useTheme();
    const { user, logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Settings className="h-8 w-8 mr-3 text-blue-500" />
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Customize your WoW Weekly Tracker experience</p>
            </div>

            <div className="space-y-6">
                {/* Appearance Settings */}
                <div className="card-enhanced">
                    <div className="flex items-center mb-4">
                        <Palette className="h-5 w-5 text-purple-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred color scheme</p>
                            </div>
                            <ThemeToggle />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Animations</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Enable smooth transitions and effects</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications Settings */}
                <div className="card-enhanced">
                    <div className="flex items-center mb-4">
                        <Bell className="h-5 w-5 text-yellow-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Desktop Notifications</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when activities are completed</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={notificationsEnabled}
                                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Activity Completion</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Notify when weekly activities are completed</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Auto-Refresh Settings */}
                <div className="card-enhanced">
                    <div className="flex items-center mb-4">
                        <RefreshCw className="h-5 w-5 text-green-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Auto-Refresh</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Enable Auto-Refresh</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically update character data</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={autoRefreshEnabled}
                                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        {autoRefreshEnabled && (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Refresh Interval</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">How often to refresh data (minutes)</p>
                                </div>
                                <select 
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Settings */}
                <div className="card-enhanced">
                    <div className="flex items-center mb-4">
                        <User className="h-5 w-5 text-blue-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Battle.net Account</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {user?.battleTag || 'Not connected'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Information */}
                <div className="card-enhanced">
                    <div className="flex items-center mb-4">
                        <Monitor className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Information</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">App Version:</span>
                            <span className="text-gray-900 dark:text-white font-medium">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                            <span className="text-gray-900 dark:text-white font-medium capitalize">{theme}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Auto-Refresh:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {autoRefreshEnabled ? `${refreshInterval} minutes` : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Notifications:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;