'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AddSubscriberModal } from '@/components/AddSubscriberModal';
import { Users, Plus, Search, Filter, MoreVertical, Wifi, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/subscribers?page=${currentPage}&limit=10&search=${encodeURIComponent(search)}`);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 500); // 500ms debounce for search
        return () => clearTimeout(timer);
    }, [currentPage, search]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscriber Directory</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {pagination ? `${pagination.total} registered subscribers.` : 'Manage your network clients.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Subscriber
                    </button>
                </header>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {loading && <Loader2 className="animate-spin text-indigo-500" size={18} />}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest px-6 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4">Subscriber</th>
                                    <th className="px-6 py-4">Bandwidth Plan</th>
                                    <th className="px-6 py-4">Network Node</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {loading && subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-indigo-600" size={32} />
                                            <p className="text-slate-400 font-medium">Fetching subscribers...</p>
                                        </td>
                                    </tr>
                                ) : subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium whitespace-nowrap">
                                            No subscribers found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/20">
                                                        {sub.full_name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-none">{sub.full_name}</p>
                                                        <p className="text-[11px] text-slate-400 mt-1">{sub.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.plan_name || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Wifi size={14} className="text-indigo-500" />
                                                    {sub.router_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                                                {sub.ip_binding || 'Dynamic'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${sub.status === 'active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : sub.status === 'suspended'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {sub.status === 'active' && <CheckCircle size={10} />}
                                                    {sub.status === 'suspended' && <XCircle size={10} />}
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">
                                Showing <span className="text-slate-900 dark:text-white font-bold">{((currentPage - 1) * 10) + 1}</span> to <span className="text-slate-900 dark:text-white font-bold">{Math.min(currentPage * 10, pagination.total)}</span> of <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span> subscribers
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                    disabled={currentPage === pagination.totalPages || loading}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <AddSubscriberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchSubscribers}
                />
            </main>
        </div>
    );
}
