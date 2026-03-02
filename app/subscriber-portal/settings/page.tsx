'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { Settings, Lock, User, Bell, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SubscriberSettings() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'security' | 'profile'>('security');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState({
        fullName: '',
        phone: '',
        email: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/subscriber/portal-data');
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile({
                    fullName: data.subscriber.fullName,
                    phone: data.subscriber.phone,
                    email: data.subscriber.email
                });
            } catch (err) {
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwords.new !== passwords.confirm) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/subscriber/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwords),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to update password');
            } else {
                setSuccess('Password updated successfully!');
                setPasswords({ current: '', new: '', confirm: '' });
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/subscriber/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                setSuccess('Profile updated successfully!');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <main className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Account Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your profile and security preferences.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <nav className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Lock size={18} />
                            Security & Password
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <User size={18} />
                            Profile Details
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 cursor-not-allowed rounded-2xl font-medium text-sm transition-all">
                            <Bell size={18} />
                            Notifications (Coming soon)
                        </button>
                    </nav>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'security' ? (
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
                                    <p className="text-sm text-slate-500">Update your security credentials regularly.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-3 text-green-600 dark:text-green-400 text-sm font-medium">
                                    <CheckCircle2 size={18} />
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group disabled:opacity-70"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        </section>
                    ) : (
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Details</h2>
                                    <p className="text-sm text-slate-500">Manage your contact information.</p>
                                </div>
                            </div>

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-3 text-green-600 dark:text-green-400 text-sm font-medium">
                                    <CheckCircle2 size={18} />
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group disabled:opacity-70"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                                </button>
                            </form>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}
