'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import {
    Users,
    Wifi,
    CreditCard,
    AlertCircle,
    TrendingUp,
    Activity,
    Server,
    Clock,
    CheckCircle2
} from 'lucide-react';

interface Stats {
    totalSubscribers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    overdueCount: number;
}

interface ActivityLog {
    id: number;
    event_type: string;
    description: string;
    status: string;
    created_at: string;
}

interface Router {
    id: number;
    name: string;
    ip_address: string;
    status: string;
    api_port: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [routers, setRouters] = useState<Router[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, activityRes, routerRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/activity'),
                fetch('/api/routers')
            ]);

            const [statsData, activityData, routerData] = await Promise.all([
                statsRes.json(),
                activityRes.json(),
                routerRes.json()
            ]);

            setStats(statsData);
            setActivities(Array.isArray(activityData) ? activityData : []);
            setRouters(Array.isArray(routerData) ? routerData : []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const runBilling = async () => {
        if (!confirm('Are you sure you want to trigger the billing cycle manually?')) return;
        try {
            const res = await fetch('/api/billing', { method: 'POST' });
            const result = await res.json();
            alert(`Billing Completed: Processed ${result.processed}, Suspended ${result.suspended}`);
            fetchDashboardData();
        } catch (error) {
            alert('Billing failed. Check logs.');
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchDashboardData}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Refresh Data
                        </button>
                        <button
                            onClick={runBilling}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                        >
                            Run Billing Cycle
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Subscribers"
                        value={loading ? '...' : stats?.totalSubscribers || 0}
                        icon={<Users size={24} />}
                        trend={{ value: 0, isUp: true }}
                        color="blue"
                    />
                    <StatCard
                        title="Active Now"
                        value={loading ? '...' : stats?.activeSubscribers || 0}
                        icon={<Activity size={24} />}
                        trend={{ value: 0, isUp: true }}
                        color="green"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={loading ? '...' : `KES ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                        icon={<TrendingUp size={24} />}
                        trend={{ value: 0, isUp: true }}
                        color="purple"
                    />
                    <StatCard
                        title="Overdue Invoices"
                        value={loading ? '...' : stats?.overdueCount || 0}
                        icon={<AlertCircle size={24} />}
                        trend={{ value: 0, isUp: false }}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Activity className="text-indigo-600" size={20} />
                            Recent System Activity
                        </h2>
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">No recent activity logs found.</div>
                            ) : activities.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.event_type === 'billing' ? 'bg-purple-100 text-purple-600' :
                                                log.event_type === 'payment' ? 'bg-green-100 text-green-600' :
                                                    log.event_type === 'connection' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {log.event_type === 'billing' ? <CreditCard size={18} /> :
                                                log.event_type === 'payment' ? <CheckCircle2 size={18} /> :
                                                    log.event_type === 'connection' ? <Wifi size={18} /> :
                                                        <Server size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{log.description}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{log.event_type}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{formatTime(log.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Router Status Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Wifi className="text-indigo-600" size={20} />
                            Network Health
                        </h2>
                        <div className="space-y-6">
                            {routers.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-sm">No routers configured.</div>
                            ) : routers.map((router) => (
                                <div key={router.id} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{router.name}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${router.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {router.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                        <span className="font-mono">{router.ip_address}</span>
                                        <span>Port: {router.api_port}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${router.status === 'online' ? 'bg-indigo-600' : 'bg-slate-300'
                                                }`}
                                            style={{ width: router.status === 'online' ? '100%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
