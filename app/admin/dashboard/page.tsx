'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { NetworkMap } from '@/components/NetworkMap';
import {
    Users,
    Wifi,
    CreditCard,
    AlertCircle,
    TrendingUp,
    Activity,
    Server,
    Clock,
    CheckCircle2,
    RefreshCw,
    Database
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

    const fetchDashboardData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const runBilling = useCallback(async () => {
        if (!confirm('Are you sure you want to trigger the billing cycle manually?')) return;
        try {
            setLoading(true);
            const res = await fetch('/api/billing', { method: 'POST' });
            const result = await res.json();
            alert(`Billing Completed: Processed ${result.processed}, Suspended ${result.suspended}`);
            fetchDashboardData();
        } catch (error) {
            console.error('Billing failed:', error);
            alert('Billing failed. Check logs.');
        } finally {
            setLoading(false);
        }
    }, [fetchDashboardData]);

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
        <div className="min-h-screen bg-background flex font-sans selection:bg-primary/20">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 space-y-10 animate-reveal">
                <header className="flex justify-between items-center bg-card/30 backdrop-blur-md p-6 rounded-[2rem] border border-border/50">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tighter">
                            Network <span className="gradient-text">Command</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm">System oversight for AirLink nodes.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchDashboardData}
                            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Sync Data
                        </button>
                        <button
                            onClick={runBilling}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
                        >
                            <Database size={14} /> Run Billing Cycle
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard
                        title="Subscribers"
                        value={loading ? '---' : stats?.totalSubscribers || 0}
                        icon={<Users size={24} />}
                        color="blue"
                    />
                    <StatCard
                        title="Nodes Active"
                        value={loading ? '---' : stats?.activeSubscribers || 0}
                        icon={<Activity size={24} />}
                        color="green"
                    />
                    <StatCard
                        title="Revenue Cycle"
                        value={loading ? '---' : `KES ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                        icon={<TrendingUp size={24} />}
                        color="purple"
                    />
                    <StatCard
                        title="Overdue Drafts"
                        value={loading ? '---' : stats?.overdueCount || 0}
                        icon={<AlertCircle size={24} />}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <NetworkMap routers={routers.map(r => ({
                            id: r.id,
                            name: r.name,
                            status: r.status as 'online' | 'offline',
                            load: Math.floor(Math.random() * 40) + 10, // Mock for visual
                            latency: Math.floor(Math.random() * 5) + 1, // Mock for visual
                            subscribers: stats?.totalSubscribers || 0 // Shared for now
                        }))} />
                    </div>

                    {/* Recent Activity Section */}
                    <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-[500px]">
                        <div className="p-8 border-b border-border/50 flex items-center gap-3 bg-muted/20">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Clock size={20} /></div>
                            <h2 className="text-xl font-black tracking-tight">System Flux</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {activities.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground font-medium">No system events recorded.</div>
                            ) : activities.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30 rounded-2xl transition-all cursor-default group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${log.event_type === 'billing' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                                            log.event_type === 'payment' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                log.event_type === 'connection' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                    'bg-muted border-border text-muted-foreground'
                                            }`}>
                                            {log.event_type === 'billing' ? <CreditCard size={20} /> :
                                                log.event_type === 'payment' ? <CheckCircle2 size={20} /> :
                                                    log.event_type === 'connection' ? <Wifi size={20} /> :
                                                        <Server size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground group-hover:gradient-text transition-all text-sm">{log.description}</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">{log.event_type}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">{formatTime(log.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
