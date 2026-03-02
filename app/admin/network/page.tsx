'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NetworkMap } from '@/components/NetworkMap';
import {
    Shield, Zap, Globe, Cpu, Hash,
    Wifi, HardDrive, RefreshCw
} from 'lucide-react';

interface Router {
    id: number;
    name: string;
    ip_address: string;
    status: string;
}

export default function NetworkIntelligencePage() {
    const [routers, setRouters] = useState<Router[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNetworkState = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/routers');
            const data = await res.json();
            setRouters(data);
        } catch (error) {
            console.error('Failed to fetch network state:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNetworkState();
    }, [fetchNetworkState]);

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-12 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-12 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Live Neural Grid</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Network <span className="gradient-text">Intelligence</span></h1>
                        <p className="text-muted-foreground font-medium text-sm max-w-xl">
                            Real-time synchronization with active edge nodes and subscriber distribution topology.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchNetworkState}
                            className="p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl transition-all text-muted-foreground hover:text-primary"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Performance HUD */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} fill="currentColor" className="text-primary" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Aggregate Velocity</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-5xl font-black tracking-tighter">842</span>
                                <span className="text-primary font-black text-sm mb-2 italic">Mbps</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[75%] animate-pulse" />
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border border-green-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield size={80} fill="currentColor" className="text-green-500" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Security Uptime</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-5xl font-black tracking-tighter">100</span>
                                <span className="text-green-500 font-black text-sm mb-2 italic">%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Zero integrity faults detected</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Node Inventory</h3>
                            {routers.map((router) => (
                                <div key={router.id} className="glass group p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${router.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <Cpu size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest">{router.name}</p>
                                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter">{router.ip_address}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-widest text-primary">8 ms</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Topology Grid */}
                    <div className="lg:col-span-3 space-y-10">
                        <div className="bg-[#050505] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden min-h-[700px] relative mt-16 scale-[1.02]">
                            <NetworkMap routers={routers.map((r) => ({
                                id: r.id,
                                name: r.name,
                                status: r.status as 'online' | 'offline',
                                load: Math.floor(Math.random() * 30) + 15,
                                latency: 4 + r.id,
                                subscribers: 12 + (r.id * 5)
                            }))} />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Sessions', val: '142', icon: <Wifi size={14} />, color: 'primary' },
                                { label: 'Resource Load', val: '24%', icon: <HardDrive size={14} />, color: 'green-500' },
                                { label: 'Edge Latency', val: '4ms', icon: <Globe size={14} />, color: 'amber-500' },
                                { label: 'Node Count', val: routers.length.toString(), icon: <Hash size={14} />, color: 'indigo-500' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all">
                                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.label}</p>
                                        <p className="text-xl font-black italic">{stat.val}</p>
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
