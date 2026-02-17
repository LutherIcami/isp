'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AddRouterModal } from '@/components/AddRouterModal';
import { Wifi, Plus, Server, HardDrive, Cpu, Activity, MoreVertical, Edit2, Loader2, RefreshCw } from 'lucide-react';

interface Router {
    id: number;
    name: string;
    ip_address: string;
    status: string;
    subscribers?: number;
    api_port: number;
}

export default function RoutersPage() {
    const [routers, setRouters] = useState<Router[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRouters = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/routers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRouters(data);
            } else {
                setRouters([]);
            }
        } catch (error) {
            console.error('Failed to fetch routers:', error);
            setRouters([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRouters();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Network Infrastructure</h1>
                        <p className="text-slate-500 dark:text-slate-400">Monitor and configure your MikroTik routers and wireless nodes.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchRouters}
                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
                        >
                            <Plus size={18} />
                            Connect New Router
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Scanning network nodes...</p>
                    </div>
                ) : routers.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                        <Server size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Routers Connected</h3>
                        <p className="text-slate-500 mb-6">You haven't added any MikroTik routers to the system yet.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
                        >
                            Add Your First Router
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {routers.map((router) => (
                            <div key={router.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${router.status === 'online' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        <Server size={28} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                            <Edit2 size={16} className="text-slate-400" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                            <MoreVertical size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{router.name}</h3>
                                    <p className="text-sm font-mono text-slate-500">{router.ip_address}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Cpu size={10} /> API PORT
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">{router.api_port}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Activity size={10} /> HEALTH
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white capitalize">{router.status}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                                            Node ID: {router.id}
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${router.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                                        <Activity size={14} className={router.status === 'online' ? 'animate-pulse' : ''} />
                                        {router.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AddRouterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchRouters}
                />
            </main>
        </div>
    );
}
