'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    Send, Users, Mail, Megaphone, Clock,
    X, Loader2, ShieldAlert, Zap, Search
} from 'lucide-react';

interface Broadcast {
    id: number;
    subject: string;
    message: string;
    type: string;
    category: string;
    recipients_count: number;
    created_at: string;
}

export default function BroadcastPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showCompose, setShowCompose] = useState(false);

    const [newBroadcast, setNewBroadcast] = useState({
        subject: '',
        message: '',
        category: 'general',
        type: 'email'
    });

    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/broadcast');
            const data = await res.json();
            setBroadcasts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch broadcasts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSending(true);
            await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBroadcast)
            });
            setShowCompose(false);
            setNewBroadcast({ subject: '', message: '', category: 'general', type: 'email' });
            fetchBroadcasts();
        } catch {
            alert('Strategic dispatch failed.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-12 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-12 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Global Communication Hub</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Communication <span className="gradient-text">Manifest</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Network-wide technical notifications and strategic dispatch.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowCompose(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Send size={20} /> Initialize Broadcast
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Metrics HUD */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8 rounded-[2rem] border border-blue-500/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 text-center px-4">Dispatch Velocity</h3>
                            <div className="text-center">
                                <span className="text-5xl font-black tracking-tighter">12k+</span>
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-2">Nodes Reached</p>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border border-green-500/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 text-center px-4">Integrity Manifest</h3>
                            <div className="text-center">
                                <span className="text-5xl font-black tracking-tighter">98.4%</span>
                                <p className="text-[8px] font-black uppercase tracking-widest text-green-500 mt-2">Delivery Precision</p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/10 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-4 px-2 text-center">Dispatch Filters</p>
                            {['All Nodes', 'Active Only', 'Maintenance', 'Bulletins'].map((filter, i) => (
                                <button key={i} className="w-full text-left p-3 hover:bg-muted/50 rounded-xl text-xs font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-all">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Historical Log */}
                    <div className="lg:col-span-3 space-y-10">
                        <div className="glass-card rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Megaphone size={20} /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight">Transmission History</h3>
                                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Global Audit Log</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="relative group overflow-hidden">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search dispatch..."
                                            className="pl-10 pr-4 py-2 bg-background border border-border/50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-border/20">
                                {loading && broadcasts.length === 0 ? (
                                    <div className="p-32 text-center text-muted-foreground font-black uppercase tracking-widest text-sm opacity-20">Syncing Manifest...</div>
                                ) : broadcasts.length === 0 ? (
                                    <div className="p-32 text-center">
                                        <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><Send size={32} /></div>
                                        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Zero strategic transmissions detected.</p>
                                    </div>
                                ) : broadcasts.map((b) => (
                                    <div key={b.id} className="p-8 hover:bg-primary/5 transition-all group flex items-start justify-between cursor-pointer">
                                        <div className="flex gap-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${b.category === 'maintenance' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                b.category === 'promo' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                                                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                                                }`}>
                                                {b.category === 'maintenance' ? <ShieldAlert size={24} /> : <Zap size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black tracking-tight group-hover:gradient-text transition-all uppercase">{b.subject}</h4>
                                                <p className="text-xs font-medium text-muted-foreground mt-1 max-w-xl line-clamp-1">{b.message}</p>
                                                <div className="flex gap-6 mt-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 flex items-center gap-2"><Users size={12} /> {b.recipients_count} Recipients</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 flex items-center gap-2"><Clock size={12} /> {new Date(b.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Transmission Manifest Node</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Dispatched Successfully</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compose Modal */}
                {showCompose && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" onClick={() => setShowCompose(false)}></div>
                        <div className="glass-card w-full max-w-3xl p-10 rounded-[4rem] relative z-10 shadow-2xl animate-reveal overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />

                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase italic gradient-text">Initialize Dispatch</h2>
                                    <p className="text-muted-foreground font-medium text-xs mt-1 uppercase tracking-widest opacity-50">Global Node Synchronization</p>
                                </div>
                                <button onClick={() => setShowCompose(false)} className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSend} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Communication Category</label>
                                        <select
                                            value={newBroadcast.category}
                                            onChange={(e) => setNewBroadcast({ ...newBroadcast, category: e.target.value })}
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="general">General Bulletin</option>
                                            <option value="maintenance">Maintenance Node Alert</option>
                                            <option value="promotional">Strategic Growth (Promo)</option>
                                            <option value="critical">System Manifest Fault</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Transmission Medium</label>
                                        <select
                                            value={newBroadcast.type}
                                            onChange={(e) => setNewBroadcast({ ...newBroadcast, type: e.target.value })}
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-primary"
                                        >
                                            <option value="email">High-Fidelity Email</option>
                                            <option value="sms">Cellular Dispatch (SMS)</option>
                                            <option value="both">Synchronized Omni-Channel</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Broadcast Subject (Strategic)</label>
                                    <input
                                        type="text"
                                        value={newBroadcast.subject}
                                        onChange={(e) => setNewBroadcast({ ...newBroadcast, subject: e.target.value })}
                                        placeholder="e.g. Planned Network Uplift - Cycle 12"
                                        className="w-full bg-muted/20 border border-border/50 rounded-2xl px-8 py-5 font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Content Manifest (Body)</label>
                                    <textarea
                                        value={newBroadcast.message}
                                        onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                                        placeholder="Input dispatch content..."
                                        className="w-full bg-muted/20 border border-border/50 rounded-3xl px-8 py-6 min-h-[200px] font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30 resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={sending || !newBroadcast.subject || !newBroadcast.message}
                                        className="w-full py-6 bg-primary text-white font-black rounded-[2.5rem] shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {sending ? <Loader2 className="animate-spin" size={24} /> : <><Megaphone size={24} /> Execute Dispatch Manifest</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
