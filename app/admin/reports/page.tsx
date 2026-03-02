'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    Users, ArrowUpRight, Download, RefreshCw,
    Target, Zap
} from 'lucide-react';

interface ReportData {
    revenueHistory: Array<{ month: string, total: string }>;
    projection: string;
    collectionStats: Array<{ status: string, total: string }>;
    growthStats: Array<{ month: string, new_subs: number }>;
    planDistribution: Array<{ name: string, subscriber_count: string }>;
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/reports');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const maxRevenue = data ? Math.max(...data.revenueHistory.map(r => parseFloat(r.total))) : 0;

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-12 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-12 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fiscal Intelligence Node</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Strategic <span className="gradient-text">Analytics</span></h1>
                        <p className="text-muted-foreground font-medium text-sm max-w-xl">
                            Real-time fiscal velocity tracking and multi-dimensional growth manifest.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchReports}
                            className="p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl transition-all text-muted-foreground hover:text-primary"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95">
                            <Download size={18} /> Export Full Manifest
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Revenue Velocity Chart */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1">Revenue Stream Velocity</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Monthly Net Collection Trace</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-primary">KES {(parseFloat(data?.revenueHistory[data.revenueHistory.length - 1]?.total || '0')).toLocaleString()}</span>
                                    <p className="text-[8px] font-black uppercase tracking-tighter text-green-500 flex items-center justify-end gap-1">
                                        <ArrowUpRight size={10} /> 12% Cycle Growth
                                    </p>
                                </div>
                            </div>

                            <div className="h-[300px] flex items-end gap-4 px-4">
                                {loading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin opacity-20" />
                                    </div>
                                ) : data?.revenueHistory.map((rev, i) => {
                                    const height = (parseFloat(rev.total) / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                            <div className="w-full relative">
                                                <div
                                                    className="w-full bg-primary/20 rounded-t-2xl transition-all duration-1000 group-hover/bar:bg-primary/40 relative overflow-hidden"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-primary/40 to-transparent" />
                                                </div>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] font-black pointer-events-none whitespace-nowrap">
                                                    KES {Math.round(parseFloat(rev.total) / 1000)}k
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-40">{rev.month.split(' ')[0]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center"><Target size={24} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue Projection</h4>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black italic">KES {(parseFloat(data?.projection || '0')).toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Target</span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground mt-2 opacity-50">Est. collection for next billing node based on active subscriptions.</p>
                            </div>

                            <div className="glass-card p-8 rounded-[2.5rem] bg-green-500/5 border border-green-500/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center"><Zap size={24} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Collection Efficacy</h4>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black italic">94.2%</span>
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Synchronized</span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground mt-2 opacity-50">Current month reconciliation rate against total invoicing manifest.</p>
                            </div>
                        </div>
                    </div>

                    {/* Side Analytics */}
                    <div className="space-y-10">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8 text-center px-4">Plan Distribution Hub</h3>
                            <div className="space-y-6">
                                {data?.planDistribution.map((plan, i) => {
                                    const totalSubs = data.planDistribution.reduce((acc, p) => acc + parseInt(p.subscriber_count), 0);
                                    const percentage = (parseInt(plan.subscriber_count) / totalSubs) * 100;
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-xs font-black uppercase tracking-widest">{plan.name}</span>
                                                <span className="text-[10px] font-black text-primary">{Math.round(percentage)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5">
                                <Users size={120} />
                            </div>
                            <h3 className="text-sm font-black tracking-tight mb-8">Subscriber Growth Manifest</h3>
                            <div className="space-y-4">
                                {data?.growthStats.slice().reverse().map((g, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{g.month}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-foreground">+{g.new_subs}</span>
                                            <div className="w-8 h-[1px] bg-primary/20" />
                                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest italic">Node Expansion</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
