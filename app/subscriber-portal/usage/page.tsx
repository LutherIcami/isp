'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Activity, Zap, Loader2, BarChart3, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscriberUsage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }
    // ... (keep the same usageData and headers)

    // Mock usage data for visual excellence
    const usageData = [
        { day: 'Mon', download: 12.4, upload: 2.1 },
        { day: 'Tue', download: 8.7, upload: 1.5 },
        { day: 'Wed', download: 15.2, upload: 3.8 },
        { day: 'Thu', download: 10.1, upload: 1.9 },
        { day: 'Fri', download: 22.5, upload: 5.2 },
        { day: 'Sat', download: 31.8, upload: 8.4 },
        { day: 'Sun', download: 14.2, upload: 4.1 },
    ];

    const maxDownload = Math.max(...usageData.map(d => d.download));

    return (
        <main className="p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        Usage Activity
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Monitor your bandwidth consumption in real-time.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    <Activity size={16} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <ArrowDown size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Download</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">114.9 GB</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <ArrowUp size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Upload</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">27.0 GB</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <Clock size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Time</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">182 hrs</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <BarChart3 size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg daily</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">16.4 GB</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-indigo-600" size={20} />
                        Weekly Usage Trend
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                            <span className="text-xs font-medium text-slate-500">Download</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                            <span className="text-xs font-medium text-slate-500">Upload</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between h-64 gap-2">
                    {usageData.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full flex flex-col items-center justify-end h-full relative">
                                {/* Download Bar */}
                                <div
                                    className="w-full max-w-[40px] bg-indigo-600 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-700 relative"
                                    style={{ height: `${(d.download / maxDownload) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap">
                                        {d.download} GB
                                    </div>
                                </div>
                                {/* Upload Bar Overlay-ish */}
                                <div
                                    className="w-full max-w-[40px] bg-indigo-300 rounded-t-lg transition-all duration-1000 mt-[-4px]"
                                    style={{ height: `${(d.upload / maxDownload) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 shadow-sm">
                        <Wifi size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Data Saver is Active</h4>
                        <p className="text-sm text-slate-500">Stream quality optimized for your current 10M plan.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-indigo-600 hover:bg-slate-50 transition-all shadow-sm">
                    Manage Network Settings
                </button>
            </div>
        </main>
    );
}
