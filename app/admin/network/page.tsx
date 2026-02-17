'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    Activity,
    Wifi,
    Cpu,
    Database,
    Users,
    Clock,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Signal
} from 'lucide-react';

interface RouterHealth {
    id: number;
    name: string;
    ip: string;
    status: 'online' | 'offline';
    cpu: number;
    memory: {
        free: number;
        total: number;
    };
    total_sessions: number;
    uptime: string;
    version: string;
    board_name: string;
}

export default function NetworkHealthPage() {
    const [stats, setStats] = useState<RouterHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/routers/health');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch health:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const totalActiveUsers = stats.reduce((acc, curr) => acc + (curr.total_sessions || 0), 0);
    const onlineCount = stats.filter(s => s.status === 'online').length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Network Health</h1>
                        <p className="text-slate-500 dark:text-slate-400">Real-time status of MikroTik nodes and active sessions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Sync</p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{lastUpdated.toLocaleTimeString()}</p>
                        </div>
                        <button
                            onClick={fetchHealth}
                            disabled={loading}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all hover:shadow-lg disabled:opacity-50 active:scale-95"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* Network Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                <Signal size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{onlineCount} / {stats.length}</h4>
                        <p className="text-sm text-slate-500 font-medium">Nodes currently online</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Load</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{totalActiveUsers}</h4>
                        <p className="text-sm text-slate-500 font-medium">Concurrent active sessions</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600">
                                <Activity size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Latency</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">~12ms</h4>
                        <p className="text-sm text-slate-500 font-medium">Optimized backbone response</p>
                    </div>
                </div>

                {/* Individual Router Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {stats.map((router) => (
                        <div key={router.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all hover:border-indigo-500/50">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${router.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                        <Wifi size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{router.name}</h3>
                                        <p className="text-xs font-mono text-slate-400">{router.ip}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${router.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${router.status === 'online' ? 'bg-green-500' : 'bg-rose-500'}`} />
                                    {router.status}
                                </div>
                            </div>

                            <div className="p-6">
                                {router.status === 'online' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                        <Cpu size={12} /> CPU Load
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{router.cpu}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${router.cpu > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${router.cpu}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                        <Database size={12} /> RAM Usage
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {Math.round(((router.memory.total - router.memory.free) / router.memory.total) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-violet-600 transition-all duration-1000"
                                                        style={{ width: `${((router.memory.total - router.memory.free) / router.memory.total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white">{router.total_sessions}</p>
                                                <p className="text-[8px] font-bold text-slate-400 mt-0.5">SESSIONS</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center col-span-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-center gap-1">
                                                    <Clock size={12} /> System Uptime
                                                </p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{router.uptime}</p>
                                                <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase">{router.board_name} {router.version}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                        <AlertCircle size={48} className="text-rose-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 dark:text-white">Connection Timeout</h4>
                                        <p className="text-sm text-slate-500 max-w-[200px]">Unable to poll metrics. Check router physical link and API credentials.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
