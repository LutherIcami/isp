'use client';

import React, { useEffect, useState } from 'react';
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
    UserCircle
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
        case 'new installation': return { icon: <UserPlus size={16} />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        case 'manual payment': return { icon: <CreditCard size={16} />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' };
        case 'bulk payment': return { icon: <CreditCard size={16} />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' };
        case 'suspension': return { icon: <ShieldAlert size={16} />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
        case 'reactivation': return { icon: <Wifi size={16} />, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' };
        default: return { icon: <ClipboardList size={16} />, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' };
    }
};

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
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
    };

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const filteredLogs = logs.filter(log =>
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.subscriber_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Trail</h1>
                        <p className="text-slate-500 dark:text-slate-400">Chronological history of all system events and operations.</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-900/40">
                        <div className="relative w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search actions, users or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={14} /> Living Data Stream
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/80 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <tr>
                                    <th className="px-8 py-5">Event Detail</th>
                                    <th className="px-8 py-5">Actor / Target</th>
                                    <th className="px-8 py-5">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw size={32} className="animate-spin text-indigo-600" />
                                                <p className="font-bold text-slate-400 tracking-wide uppercase text-xs">Replaying History...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-32 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No matching activities found</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const style = getActionStyles(log.action);
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 p-2 rounded-xl shrink-0 ${style.color}`}>
                                                            {style.icon}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${style.color}`}>
                                                                    {log.action}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                                                                {log.details}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                                            <UserCircle size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {log.subscriber_name || 'System Auto'}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-slate-400">USER_REF_{log.subscriber_id || '000'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {new Date(log.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-medium">
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
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Showing Page {currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages || loading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
