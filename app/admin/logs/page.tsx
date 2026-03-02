'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    ClipboardList,
    UserPlus,
    CreditCard,
    ShieldAlert,
    Wifi,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
    UserCircle,
    Loader2
} from 'lucide-react';

interface ActivityLog {
    id: number;
    subscriber_id: number;
    subscriber_name: string;
    action: string;
    details: string;
    created_at: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const getActionStyles = (action: string) => {
    switch (action.toLowerCase()) {
        case 'new installation': return { icon: <UserPlus size={16} />, color: 'bg-green-500/10 text-green-500 border border-green-500/20' };
        case 'manual payment': return { icon: <CreditCard size={16} />, color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' };
        case 'bulk payment': return { icon: <CreditCard size={16} />, color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20' };
        case 'suspension': return { icon: <ShieldAlert size={16} />, color: 'bg-red-500/10 text-red-500 border border-red-500/20' };
        case 'reactivation': return { icon: <Wifi size={16} />, color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };
        default: return { icon: <ClipboardList size={16} />, color: 'bg-muted text-muted-foreground border border-border/50' };
    }
};

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/logs?page=${currentPage}&limit=20`);
            const result = await res.json();
            if (result.data) {
                setLogs(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log =>
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.subscriber_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Telemetry</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Audit <span className="gradient-text">Trail</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Chronological history of all system events and operations.
                        </p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-4 bg-muted/20 hover:bg-muted border border-border/50 rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/20">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search actions, users or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-background border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold shadow-inner"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-xl">
                            <Clock size={14} /> Living Data Stream
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/50">
                                <tr>
                                    <th className="px-10 py-6">Event Detail</th>
                                    <th className="px-10 py-6">Actor / Target</th>
                                    <th className="px-10 py-6 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 size={32} className="animate-spin text-primary" />
                                                <p className="font-black text-muted-foreground tracking-[0.2em] uppercase text-[10px]">Replaying History Manifest...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-32 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-50"><ClipboardList size={32} /></div>
                                            No matching activities found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const style = getActionStyles(log.action);
                                        return (
                                            <tr key={log.id} className="hover:bg-primary/5 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 p-3 rounded-2xl shrink-0 ${style.color}`}>
                                                            {style.icon}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${style.color}`}>
                                                                    {log.action}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-bold text-foreground leading-relaxed max-w-xl">
                                                                {log.details}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-muted/50 rounded-2xl border border-border/50 flex items-center justify-center text-muted-foreground">
                                                            <UserCircle size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                                                {log.subscriber_name || 'System Auto'}
                                                            </p>
                                                            <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/60">USER_REF_{log.subscriber_id || '000'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div>
                                                        <p className="text-sm font-black text-foreground tracking-tighter uppercase">
                                                            {new Date(log.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase mt-1">
                                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-8 bg-muted/10 border-t border-border/50 flex justify-between items-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Manifest Page {currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border/50 bg-background text-xs font-black uppercase tracking-widest text-foreground disabled:opacity-30 disabled:grayscale hover:bg-muted transition-all active:scale-95"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages || loading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border/50 bg-background text-xs font-black uppercase tracking-widest text-foreground disabled:opacity-30 disabled:grayscale hover:bg-muted transition-all active:scale-95"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
