'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    download_speed: string;
    upload_speed: string;
    price: string;
    billing_cycle: string;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/plans');
            const data = await res.json();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Service Profiles</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Bandwidth <span className="gradient-text">Plans</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Manage your ISP packages and bandwidth service profiles.
                        </p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95">
                        <Plus size={20} />
                        Create New Plan
                    </button>
                </header>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden relative min-h-[600px]">
                    <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/20">
                        <div className="relative w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search manifest..."
                                className="w-full pl-12 pr-4 py-3 bg-background border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted hover:bg-muted/80 px-4 py-2 rounded-xl transition-all border border-border/50 cursor-pointer">
                            <span>Total Active Profiles: {plans.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] px-10">
                                <tr>
                                    <th className="px-10 py-6">Plan Name</th>
                                    <th className="px-10 py-6">Bandwidth (D/U)</th>
                                    <th className="px-10 py-6">Price (KES)</th>
                                    <th className="px-10 py-6">Billing Cycle</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center text-muted-foreground font-black uppercase tracking-widest text-sm opacity-20 animate-pulse">
                                            Syncing Manifest...
                                        </td>
                                    </tr>
                                ) : plans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><Package size={32} /></div>
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Zero profiles detected.</p>
                                        </td>
                                    </tr>
                                ) : plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-primary/5 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20">
                                                    <Package size={20} />
                                                </div>
                                                <span className="font-black text-foreground uppercase tracking-tight text-lg group-hover:gradient-text">{plan.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-mono text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-3 py-1 rounded-xl text-[9px] uppercase font-black tracking-widest">Down</span>
                                                <span className="font-bold text-foreground">{plan.download_speed}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 py-1 rounded-xl text-[9px] uppercase font-black tracking-widest">Up</span>
                                                <span className="font-bold text-foreground">{plan.upload_speed}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-mono font-black text-foreground text-lg">
                                            {parseFloat(plan.price).toLocaleString()}
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-4 py-1.5 rounded-full bg-muted border border-border/50 text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                                                {plan.billing_cycle}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button className="p-3 bg-muted/30 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
