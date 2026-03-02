'use client';

import React, { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import {
    Wifi, CreditCard, LifeBuoy, Zap,
    ArrowUpRight, ArrowDownRight, Clock,
    CheckCircle2, AlertCircle, LogOut,
    Maximize2, ShieldCheck, Gauge, Activity
} from 'lucide-react';

interface Profile {
    id: number;
    full_name: string;
    email: string;
    status: string;
    mikrotik_username: string | null;
    plan_name: string | null;
    download_speed: string | null;
    upload_speed: string | null;
    next_billing_date: string | null;
    router_name: string | null;
}

interface Invoice {
    id: number;
    amount: string;
    status: string;
    created_at: string;
}

interface Ticket {
    id: number;
    subject: string;
    status: string;
}

interface PortalData {
    profile: Profile;
    invoices: Invoice[];
    tickets: Ticket[];
}

export default function SubscriberDashboard() {
    const [data, setData] = useState<PortalData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/subscriber/portal');
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { profile, invoices, tickets } = data!;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-6 lg:p-12">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-16 animate-reveal">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/20">
                        <Wifi size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">AirLink Portal</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connected Identity</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="font-black text-sm">{profile.full_name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{profile.mikrotik_username} • {profile.status}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="p-4 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-2xl transition-all shadow-xl"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Plan & Usage */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="glass-card relative group overflow-hidden p-10 rounded-[3rem] border border-border/50 shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <Zap size={200} fill="currentColor" className="text-primary" />
                        </div>

                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${profile.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    Status: {profile.status}
                                </span>
                                <h2 className="text-5xl font-black tracking-tight mt-6 leading-none">{profile.plan_name} <br /> <span className="gradient-text italic">Premium Node</span></h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Cycle Validity</p>
                                <p className="text-lg font-black">{profile.next_billing_date ? new Date(profile.next_billing_date).toLocaleDateString() : 'Manual Renewal'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-muted/20 p-8 rounded-[2.5rem] border border-border/30 flex items-center gap-6">
                                <div className="p-4 bg-primary/10 text-primary rounded-2xl"><ArrowDownRight size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Peak Downlink</p>
                                    <p className="text-2xl font-black tracking-tighter">{profile.download_speed}bps</p>
                                </div>
                            </div>
                            <div className="bg-muted/20 p-8 rounded-[2.5rem] border border-border/30 flex items-center gap-6">
                                <div className="p-4 bg-muted/50 text-muted-foreground rounded-2xl"><ArrowUpRight size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Peak Uplink</p>
                                    <p className="text-2xl font-black tracking-tighter">{profile.upload_speed}bps</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-5 bg-primary text-primary-foreground font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest">
                                Upgrade Plan
                            </button>
                            <button className="flex-1 py-5 bg-muted/50 text-foreground font-black rounded-3xl border border-border/50 hover:bg-muted transition-all text-sm uppercase tracking-widest">
                                Network Stats
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Speed Test Simulation */}
                        <div className="glass-card p-8 rounded-[3rem] border border-border/50 flex flex-col justify-between min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Gauge className="text-primary" size={20} />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Neural Speed Audit</h3>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="text-center py-6">
                                <div className="text-6xl font-black italic tracking-tighter mb-2">94.8<span className="text-xl text-primary font-black ml-1">Mbps</span></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current Velocity Index</p>
                            </div>
                            <button className="w-full py-3 bg-muted/50 hover:bg-muted text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-border/50 text-foreground">
                                Recalibrate Connection
                            </button>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div className="glass-card p-8 rounded-[3rem] border border-border/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="text-primary" size={20} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Node Activity</h3>
                            </div>
                            <div className="space-y-6">
                                {tickets.length > 0 ? tickets.map((t, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground flex-shrink-0 text-xs font-bold border border-border/50">
                                            TR
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground line-clamp-1">{t.subject}</p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mt-1">{t.status}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground font-medium text-xs py-8 italic">Zero integrity faults detected.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Billing & Support */}
                <div className="space-y-10">
                    {/* Billing Terminal */}
                    <div className="glass-card p-10 rounded-[3rem] border border-border/50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><CreditCard size={20} /></div>
                            <h3 className="text-sm font-black tracking-tight uppercase text-foreground">Billing Manifest</h3>
                        </div>

                        <div className="space-y-6">
                            {invoices.length > 0 ? invoices.map((inv, i) => (
                                <div key={i} className="group cursor-pointer flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-transparent hover:border-border/50 transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{new Date(inv.created_at).toLocaleDateString()}</p>
                                        <p className="text-sm font-black text-foreground">KES {inv.amount}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {inv.status}
                                        </span>
                                        <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform opacity-30" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-30 text-foreground"><CreditCard size={40} className="mx-auto" /></div>
                            )}
                        </div>

                        <button className="w-full mt-10 py-5 bg-primary text-primary-foreground font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all text-sm uppercase tracking-widest">
                            Quick Reconcile (M-Pesa)
                        </button>
                    </div>

                    {/* Support Node */}
                    <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"><LifeBuoy size={20} /></div>
                            <h3 className="text-sm font-black tracking-tight uppercase text-foreground">Technical Node</h3>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-8">
                            Experience a fault? Log a technical report directly to our edge response manifest.
                        </p>
                        <button className="w-full py-4 bg-primary/20 hover:bg-primary/30 text-primary font-black rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em]">
                            Open Response Ticket
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    )
}
