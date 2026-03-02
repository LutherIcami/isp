'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AddSubscriberModal } from '@/components/AddSubscriberModal';
import {
    Users, Plus, Search, Filter, MoreVertical, Wifi,
    CheckCircle, XCircle, ChevronLeft, ChevronRight,
    Loader2, Settings, Activity, CreditCard
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

    // Detail View State
    const [selectedSubscriberId, setSelectedSubscriberId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/subscribers/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchSubscribers = async () => {
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
    };

    const fetchDetail = async (id: number) => {
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
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
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
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, search, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto relative">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Subscriber Base</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            Manage connectivity, plans and billing for your client network.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        New Installation
                    </button>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-slate-200 dark:border-l-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Subscribers</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-green-500">
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Active Now</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Suspended</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.suspended}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">New Installations</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">+{stats.new_count}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-8">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search client directory or phone..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer"
                            >
                                <option value="all">Filter: All Status</option>
                                <option value="active">Filter: Active</option>
                                <option value="suspended">Filter: Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 text-[10px] uppercase font-bold tracking-widest px-6 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-5">Client Information</th>
                                    <th className="px-6 py-5">Connectivity Plan</th>
                                    <th className="px-6 py-5">Network Node</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {loading && subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-indigo-600">
                                            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                            <p className="text-slate-400 font-medium">Accessing node records...</p>
                                        </td>
                                    </tr>
                                ) : subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">
                                            No installations found.
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
                                            className={`hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-all group cursor-pointer ${selectedSubscriberId === sub.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm font-sans uppercase">
                                                        {sub.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-none mb-1.5">{sub.full_name || 'Unknown Client'}</p>
                                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded italic font-mono">{sub.ip_binding || '0.0.0.0'}</span>
                                                            <span className="opacity-30">|</span>
                                                            <span className="truncate max-w-[120px]">{sub.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{sub.plan_name || 'No Plan'}</span>
                                                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight">Active Plan</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 w-fit rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <Wifi size={14} className="text-indigo-500" />
                                                    <span className="font-bold text-[11px] text-slate-600 dark:text-slate-400">{sub.router_name || 'Node Offline'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-sm ${sub.status === 'active'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-white ${sub.status === 'active' ? 'animate-pulse' : ''}`}></div>
                                                    {sub.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatus(sub.id, sub.status);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm ${sub.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                                >
                                                    {sub.status === 'active' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                                Page {currentPage} of {pagination.totalPages} <span className="mx-2">/</span> {pagination.total} Records
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-950 disabled:opacity-50 font-black text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-800 uppercase tracking-tighter"
                                >
                                    <ChevronLeft size={16} />
                                    Prev
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1)); }}
                                    disabled={currentPage === pagination.totalPages || loading}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-950 disabled:opacity-50 font-black text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-800 uppercase tracking-tighter"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
            <aside className={`fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 z-50 ${selectedSubscriberId ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedSubscriberId && (
                    <div className="h-full flex flex-col p-8 overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <button
                                onClick={() => setSelectedSubscriberId(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <ChevronRight size={24} className="text-slate-400" />
                            </button>
                            <div className="flex gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Client Profile
                            </div>
                        </div>

                        {detailLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
                            </div>
                        ) : detailData?.subscriber ? (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-xl shadow-indigo-600/30 uppercase">
                                        {detailData.subscriber.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{detailData.subscriber.full_name || 'Generic Client'}</h2>
                                    <p className="text-slate-500 font-medium text-sm">{detailData.subscriber.email}</p>
                                    <div className={`mt-4 mx-auto w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${detailData.subscriber.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {detailData.subscriber.status} Subscription
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plan</p>
                                        <p className="font-black text-slate-900 dark:text-white">{detailData.subscriber.plan_name}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Speed</p>
                                        <p className="font-black text-slate-900 dark:text-white">{detailData.subscriber.download_speed}/{detailData.subscriber.upload_speed}</p>
                                    </div>
                                </div>

                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={12} className="text-indigo-600" />
                                        Node History
                                    </h3>
                                    <div className="space-y-4">
                                        {detailData.activity.length === 0 ? (
                                            <p className="text-sm text-slate-400 italic">No recent logs found.</p>
                                        ) : detailData.activity.map((act: any) => (
                                            <div key={act.id} className="flex gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight">{act.action}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{act.details}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{new Date(act.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={12} className="text-indigo-600" />
                                        Collection Summary
                                    </h3>
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl">
                                        <div className="relative z-10">
                                            <div className="space-y-4">
                                                {detailData.invoices.length === 0 ? (
                                                    <p className="text-xs text-slate-500">No invoices issued yet.</p>
                                                ) : detailData.invoices.map((inv: any) => (
                                                    <div key={inv.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                        <div>
                                                            <p className="font-bold">KES {parseFloat(inv.amount).toLocaleString()}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase">{new Date(inv.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                            {inv.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : null}

                        {detailData?.subscriber && (
                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => toggleStatus(detailData.subscriber.id, detailData.subscriber.status)}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-[0.98] ${detailData.subscriber.status === 'active' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-green-600 text-white shadow-green-600/20'}`}
                                >
                                    {detailData.subscriber.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Overlay */}
            {selectedSubscriberId && (
                <div
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSelectedSubscriberId(null)}
                ></div>
            )}
        </div>
    );
}
