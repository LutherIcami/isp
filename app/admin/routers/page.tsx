'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AddRouterModal } from '@/components/AddRouterModal';
import { Plus, Server, Cpu, Activity, MoreVertical, Edit2, Loader2, RefreshCw } from 'lucide-react';

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

    const fetchRouters = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchRouters();
    }, [fetchRouters]);

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Core Infrastructure</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Network <span className="gradient-text">Nodes</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Monitor and configure your MikroTik edge routers and wireless links.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchRouters}
                            className="p-4 bg-muted/20 hover:bg-muted border border-border/50 rounded-2xl text-muted-foreground hover:text-primary transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Plus size={20} />
                            Provision Node
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground/50">
                        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
                        <p className="font-black uppercase tracking-widest text-xs">Scanning network nodes...</p>
                    </div>
                ) : routers.length === 0 ? (
                    <div className="glass-card border border-border/50 rounded-[3rem] p-16 text-center shadow-sm">
                        <Server size={48} className="mx-auto text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-black tracking-tight text-foreground mb-2">No active nodes detected</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-8">Establish a connection to your first MikroTik edge router.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl transition-all inline-flex items-center gap-2 uppercase tracking-widest shadow-primary/20"
                        >
                            <Plus size={18} /> Add Edge Node
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {routers.map((router) => (
                            <div key={router.id} className="glass-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-4 rounded-2xl ${router.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <Server size={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 hover:bg-muted rounded-xl transition-colors">
                                            <Edit2 size={16} className="text-muted-foreground" />
                                        </button>
                                        <button className="p-3 hover:bg-muted rounded-xl transition-colors">
                                            <MoreVertical size={16} className="text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-foreground mb-1 group-hover:gradient-text transition-all tracking-tight uppercase">{router.name}</h3>
                                    <p className="text-xs font-mono font-bold text-muted-foreground tracking-widest">{router.ip_address}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-muted/20 rounded-[1.5rem] border border-border/30">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Cpu size={12} /> API PORT
                                        </p>
                                        <p className="font-black text-foreground text-lg">{router.api_port}</p>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-[1.5rem] border border-border/30">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Activity size={12} /> HEALTH
                                        </p>
                                        <p className="font-black text-foreground text-lg capitalize">{router.status}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-border/10">
                                    <div className="flex items-center gap-2">
                                        <div className="px-4 py-1.5 bg-muted/40 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                                            Node Manifest: #{router.id}
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${router.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                                        <Activity size={14} className={router.status === 'online' ? 'animate-pulse' : ''} />
                                        {router.status}
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
