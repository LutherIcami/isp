'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AddSubscriberModal } from '@/components/AddSubscriberModal';
import {
    Users, Plus, Search,
    ChevronLeft,
    Loader2, Activity, CreditCard, ShieldAlert,
    BrainCircuit, AlertTriangle, TrendingDown
} from 'lucide-react';

interface Subscriber {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    plan_name: string;
    router_name: string;
    ip_binding: string;
    status: string;
    churn_score: number;
    risk_factors: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, new_count: 0 });
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [runningAnalysis, setRunningAnalysis] = useState(false);

    // Detail View State
    const [selectedSubscriberId, setSelectedSubscriberId] = useState<number | null>(null);
    interface DetailData {
        subscriber: Subscriber & { download_speed: string };
        activity: { id: number; action: string; details: string; created_at: string }[];
        invoices: { id: number; amount: string; status: string; created_at: string }[];
    }
    const [detailData, setDetailData] = useState<DetailData | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/subscribers/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    const fetchSubscribers = useCallback(async () => {
        try {
            setLoading(true);
            const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
            const res = await fetch(`/api/subscribers?page=${currentPage}&limit=10&search=${encodeURIComponent(search)}${statusParam}`);
            const result = await res.json();
            if (result.data && Array.isArray(result.data)) {
                setSubscribers(result.data);
                setPagination(result.pagination);
            } else {
                setSubscribers([]);
                setPagination(null);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            setSubscribers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, statusFilter]);

    const runChurnAnalysis = useCallback(async () => {
        setRunningAnalysis(true);
        try {
            const res = await fetch('/api/admin/churn/analyze', { method: 'POST' });
            const result = await res.json();
            alert(result.message);
            fetchSubscribers();
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed');
        } finally {
            setRunningAnalysis(false);
        }
    }, [fetchSubscribers]);

    const fetchDetail = useCallback(async (id: number) => {
        try {
            setDetailLoading(true);
            const res = await fetch(`/api/subscribers/${id}`);
            const data = await res.json();
            setDetailData(data);
        } catch (error) {
            console.error('Failed to fetch detail:', error);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const toggleStatus = useCallback(async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await fetch(`/api/subscribers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchSubscribers();
            if (selectedSubscriberId === id) fetchDetail(id);
            fetchStats();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    }, [fetchSubscribers, fetchDetail, fetchStats, selectedSubscriberId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchSubscribers]);

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden selection:bg-primary/20">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex flex-wrap justify-between items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Subscriber <span className="gradient-text">Manifest</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Real-time oversight of your client network and retention IQ.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={runChurnAnalysis}
                            disabled={runningAnalysis}
                            className="bg-secondary text-secondary-foreground border border-border px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-3 shadow-xl shadow-black/5"
                        >
                            {runningAnalysis ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                            {runningAnalysis ? 'Analyzing Risk...' : 'Predict Retention'}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Plus size={20} />
                            Deploy Connection
                        </button>
                    </div>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div className="glass-card p-6 rounded-[2rem] border-l-4 border-l-primary/30 group hover:scale-[1.02] transition-transform">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-50">Total Base</p>
                        <h3 className="text-3xl font-black text-foreground tabular-nums group-hover:gradient-text transition-all">{stats.total}</h3>
                    </div>
                    <div className="glass-card p-6 rounded-[2rem] border-l-4 border-l-green-500/30 group hover:scale-[1.02] transition-transform">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2 opacity-50">Active Now</p>
                        <h3 className="text-3xl font-black text-foreground tabular-nums group-hover:text-green-500 transition-all">{stats.active}</h3>
                    </div>
                    <div className="glass-card p-6 rounded-[2rem] border-l-4 border-l-red-500/30 group hover:scale-[1.02] transition-transform">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 opacity-50">Suspended</p>
                        <h3 className="text-3xl font-black text-foreground tabular-nums group-hover:text-red-500 transition-all">{stats.suspended}</h3>
                    </div>
                    <div className="glass-card p-6 rounded-[2rem] border-l-4 border-l-indigo-500/30 group hover:scale-[1.02] transition-transform">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 opacity-50">Deployment Cycle</p>
                        <h3 className="text-3xl font-black text-foreground tabular-nums group-hover:text-indigo-500 transition-all">+{stats.new_count}</h3>
                    </div>
                </div>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden mb-10">
                    <div className="p-6 border-b border-border/50 flex flex-wrap gap-6 items-center justify-between bg-muted/20">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search client directory or phone..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-6 py-4 bg-background/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/50 border border-transparent shadow-inner"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-background/50 border border-border/20 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground focus:ring-1 focus:ring-primary/20 outline-none transition-all cursor-pointer shadow-sm hover:border-primary/20"
                            >
                                <option value="all">Status: All Manifests</option>
                                <option value="active">Status: Active Only</option>
                                <option value="suspended">Status: Suspended Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap">
                                <tr>
                                    <th className="px-10 py-6">Client Information</th>
                                    <th className="px-10 py-6 text-center">Retention Risk</th>
                                    <th className="px-10 py-6">Throughput</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6 text-right">Terminal Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading && subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-24 text-center">
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Node Records...</p>
                                        </td>
                                    </tr>
                                ) : subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-24 text-center">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><ShieldAlert size={32} /></div>
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No installations found in this lifecycle.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            onClick={() => {
                                                setSelectedSubscriberId(sub.id);
                                                fetchDetail(sub.id);
                                            }}
                                            className={`hover:bg-primary/5 transition-all group cursor-pointer ${selectedSubscriberId === sub.id ? 'bg-primary/[0.03]' : ''}`}
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-black text-lg shadow-[inset_0_0_12px_rgba(var(--primary),0.05)] border border-primary/10 group-hover:scale-110 transition-transform">
                                                        {sub.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground text-lg tracking-tight mb-1 group-hover:gradient-text transition-all">{sub.full_name || 'Generic Node'}</p>
                                                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                                                            <span>{sub.phone}</span>
                                                            <span className="w-1 h-1 bg-border rounded-full" />
                                                            <span className="font-mono lowercase italic">{sub.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 ${parseFloat(sub.churn_score?.toString() || '0') > 60 ? 'bg-red-500/10 text-red-500' :
                                                        parseFloat(sub.churn_score?.toString() || '0') > 30 ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {parseFloat(sub.churn_score?.toString() || '0') > 60 ? 'High Risk' :
                                                            parseFloat(sub.churn_score?.toString() || '0') > 30 ? 'Moderate' : 'Stable'}
                                                    </div>
                                                    <p className="text-[10px] font-black opacity-30 tabular-nums">SCORE: {Math.round(parseFloat(sub.churn_score?.toString() || '0'))}%</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="space-y-1">
                                                    <span className="font-black text-foreground tracking-tight text-base">{sub.plan_name || 'Unset'}</span>
                                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                                                        <TrendingDown size={10} className="rotate-180" /> Priority Feed
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 w-fit border ${sub.status === 'active'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                    {sub.status}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatus(sub.id, sub.status);
                                                    }}
                                                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/5 active:scale-95 ${sub.status === 'active' ? 'bg-red-500 text-white hover:opacity-90' : 'bg-green-500 text-white hover:opacity-90'}`}
                                                >
                                                    {sub.status === 'active' ? 'Terminate' : 'Deploy'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AddSubscriberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        fetchSubscribers();
                        fetchStats();
                    }}
                />
            </main>

            {/* Subscriber Detail Drawer */}
            <aside className={`fixed right-0 top-0 h-full w-[500px] bg-background border-l border-border shadow-2xl transition-transform duration-500 z-50 overflow-hidden ${selectedSubscriberId ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedSubscriberId && (
                    <div className="h-full flex flex-col p-10 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />

                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <button
                                onClick={() => setSelectedSubscriberId(null)}
                                className="p-3 bg-muted/20 hover:bg-muted/40 text-foreground rounded-2xl transition-all hover:-translate-x-1"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Client Dossier Analysis</p>
                        </div>

                        {detailLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                                <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Accessing Bio-Metric Node...</p>
                            </div>
                        ) : detailData?.subscriber ? (
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-12 relative z-10 pb-10">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-primary text-white flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-2xl shadow-primary/30 border-4 border-background group hover:scale-[1.05] transition-transform">
                                        {detailData.subscriber.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter mb-1 uppercase">{detailData.subscriber.full_name || 'Generic Node'}</h2>
                                    <p className="text-muted-foreground font-black text-xs uppercase tracking-widest opacity-40">{detailData.subscriber.email}</p>

                                    <div className="mt-8 flex justify-center gap-3">
                                        <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${detailData.subscriber.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {detailData.subscriber.status} Channel
                                        </div>
                                    </div>
                                </div>

                                {Math.round(detailData.subscriber.churn_score || 0) > 0 && (
                                    <section className="glass-card p-6 rounded-[2rem] border-amber-500/20 bg-amber-500/[0.03]">
                                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Retention Intelligence
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-foreground opacity-60">Retention Risk</span>
                                                <span className="text-lg font-black text-amber-500 tracking-tight">{Math.round(detailData.subscriber.churn_score || 0)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-amber-500/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                                                    style={{ width: `${detailData.subscriber.churn_score}%` }}
                                                />
                                            </div>
                                            <div className="pt-2 space-y-2">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Primary Concerns</p>
                                                {detailData.subscriber.risk_factors?.split(',').map((factor: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-foreground/70 bg-background/50 p-2 rounded-xl border border-border/20 uppercase tracking-tight">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        {factor.trim()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="glass-card p-6 rounded-[2rem] text-center group hover:border-primary/30 transition-all border border-border/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-50 text-center">Throughput</p>
                                        <p className="text-xl font-black text-foreground group-hover:gradient-text transition-all uppercase tracking-tighter">{detailData.subscriber.download_speed}</p>
                                    </div>
                                    <div className="glass-card p-6 rounded-[2rem] text-center group hover:border-primary/30 transition-all border border-border/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-50 text-center">Node Path</p>
                                        <p className="text-xl font-black text-foreground group-hover:gradient-text transition-all truncate tracking-tighter uppercase">{detailData.subscriber.router_name || 'OFFLINE'}</p>
                                    </div>
                                </div>

                                <section>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-3 opacity-50">
                                        <Activity size={14} className="text-primary" />
                                        Activity Manifest
                                    </h3>
                                    <div className="space-y-6">
                                        {detailData.activity.length === 0 ? (
                                            <div className="py-8 text-center text-xs font-medium text-muted-foreground opacity-30 italic">No node cycles recorded.</div>
                                        ) : detailData.activity.map((act) => (
                                            <div key={act.id} className="flex gap-6 group">
                                                <div className="relative flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full border-2 border-primary bg-background z-10 group-hover:scale-125 transition-transform"></div>
                                                    <div className="absolute top-3 w-[2px] h-full bg-border/20 -translate-x-[0px]"></div>
                                                </div>
                                                <div className="pb-8">
                                                    <p className="text-sm font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors uppercase">{act.action}</p>
                                                    <p className="text-xs text-muted-foreground mt-2 font-medium line-clamp-2 leading-relaxed">{act.details}</p>
                                                    <p className="text-[10px] text-muted-foreground font-black mt-3 opacity-30 uppercase tracking-widest">{new Date(act.created_at).toLocaleString('en-GB')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-3 opacity-50">
                                        <CreditCard size={14} className="text-primary" />
                                        Collection Manifest
                                    </h3>
                                    <div className="glass-card p-6 rounded-[2rem] border border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden">
                                        <div className="space-y-4">
                                            {detailData.invoices.length === 0 ? (
                                                <div className="py-4 text-center text-[10px] font-black uppercase opacity-20 tracking-widest Italics">Zero debit records found.</div>
                                            ) : detailData.invoices.map((inv) => (
                                                <div key={inv.id} className="flex justify-between items-center text-sm border-b border-border/10 pb-4 last:border-0 last:pb-0 group">
                                                    <div className="space-y-1">
                                                        <p className="font-black text-foreground tabular-nums tracking-tighter">KES {parseFloat(inv.amount).toLocaleString()}</p>
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{new Date(inv.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${inv.status === 'paid'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : null}

                        {detailData?.subscriber && (
                            <div className="mt-auto pt-8 border-t border-border bg-background/50 backdrop-blur-md relative z-10">
                                <button
                                    onClick={() => toggleStatus(detailData.subscriber.id, detailData.subscriber.status)}
                                    className={`w-full py-5 rounded-[1.75rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.98] ${detailData.subscriber.status === 'active' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-green-600 text-white shadow-green-600/20'}`}
                                >
                                    {detailData.subscriber.status === 'active' ? 'Execute Account Termination' : 'Initiate Node Activation'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Overlay */}
            {selectedSubscriberId && (
                <div
                    className="fixed inset-0 bg-background/40 backdrop-blur-xl z-40 transition-opacity animate-fade-in"
                    onClick={() => setSelectedSubscriberId(null)}
                ></div>
            )}
        </div>
    );
}
