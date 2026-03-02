'use client';

import React from 'react';
import { Server, Wifi, Activity, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface RouterNode {
    id: number;
    name: string;
    status: 'online' | 'offline' | 'error';
    load: number;
    latency: number;
    subscribers: number;
}

interface NetworkMapProps {
    routers: RouterNode[];
}

export const NetworkMap = ({ routers }: NetworkMapProps) => {
    return (
        <div className="glass-card p-8 relative overflow-hidden h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-5 pointer-events-none" />

            <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Active Node Topology</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Live Pulse Distribution</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full ring-1 ring-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Synchronized</span>
                    </div>
                </div>
            </div>

            <div className="relative h-full flex items-center justify-center">
                {/* Central Core */}
                <div className="absolute w-40 h-40 border-2 border-primary/20 rounded-full animate-ping opacity-20" />
                <div className="absolute w-64 h-64 border border-primary/10 rounded-full animate-pulse-subtle" />

                <div className="relative z-10 w-24 h-24 glass-card border-primary/40 rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-primary/30">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary mb-1 animate-float">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">AIRLINK CORE</span>
                </div>

                {/* Nodes Distributed Around */}
                {routers.map((router, i) => {
                    const angle = (i * (360 / Math.max(routers.length, 1))) * (Math.PI / 180);
                    const radius = 160;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <div
                            key={router.id}
                            style={{
                                transform: `translate(${x}px, ${y}px)`,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="absolute group"
                        >
                            {/* Connector Line with Data Flow Pulse */}
                            <div
                                style={{
                                    width: `${radius - 48}px`,
                                    transform: `rotate(${angle + Math.PI}rad)`,
                                    transformOrigin: 'right center',
                                    left: `-${radius - 48}px`
                                }}
                                className="absolute top-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-20 animate-neural-pulse" />
                            </div>

                            <div className="glass-card p-4 rounded-2xl w-48 hover:scale-105 transition-all cursor-pointer border-primary/0 hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/20">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-xl ${router.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <Server size={18} />
                                    </div>
                                    <div className="text-right">
                                        <div className={`h-1.5 w-1.5 rounded-full inline-block ${router.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'} mb-1`} />
                                        <p className="text-[8px] font-black uppercase tracking-tighter opacity-40">{router.status}</p>
                                    </div>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest mb-1 truncate">{router.name}</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-medium text-muted-foreground">
                                        <span>Load</span>
                                        <span>{router.load}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${router.load > 80 ? 'bg-red-500' : 'bg-primary'}`}
                                            style={{ width: `${router.load}%` }}
                                        />
                                    </div>
                                    <div className="pt-2 flex justify-between items-center text-[8px] font-black uppercase text-muted-foreground opacity-50">
                                        <span className="flex items-center gap-1"><Wifi size={8} /> {router.latency}ms</span>
                                        <span>{router.subscribers} Subs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                @keyframes neural-pulse {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
                .animate-neural-pulse {
                    animation: neural-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};
