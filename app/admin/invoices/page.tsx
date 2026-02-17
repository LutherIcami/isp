'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FileText, Download, Filter, Search, MoreVertical, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Loader2, X, Bell } from 'lucide-react';

interface Invoice {
    id: number;
    subscriber_name: string;
    amount: string;
    billing_period_start: string;
    billing_period_end: string;
    due_date: string;
    status: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [processingBulk, setProcessingBulk] = useState(false);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const statusParam = statusFilter ? `&status=${statusFilter}` : '';
            const res = await fetch(`/api/invoices?page=${currentPage}&limit=10${statusParam}`);
            const result = await res.json();
            if (result.data) {
                setInvoices(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        setSelectedIds([]); // Reset selection on page or filter change
    }, [currentPage, statusFilter]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(invoices.map(inv => inv.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkPaid = async () => {
        if (!confirm(`Mark ${selectedIds.length} invoices as paid?`)) return;

        try {
            setProcessingBulk(true);
            const res = await fetch('/api/invoices/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceIds: selectedIds, action: 'mark_as_paid' })
            });

            if (res.ok) {
                alert(`Successfully processed ${selectedIds.length} payments.`);
                setSelectedIds([]);
                fetchInvoices();
            }
        } catch (error) {
            alert('Bulk update failed');
        } finally {
            setProcessingBulk(false);
        }
    };

    const handleBulkPDF = () => {
        if (selectedIds.length === 0) return;
        window.open(`/admin/invoices/print?ids=${selectedIds.join(',')}`, '_blank');
    };

    const handleSendReminders = async () => {
        if (!confirm('Send SMS reminders to all subscribers with invoices due in 2 days?')) return;
        try {
            setProcessingBulk(true);
            const res = await fetch('/api/notifications/reminders', { method: 'POST' });
            const result = await res.json();
            if (res.ok) {
                alert(`Successfully sent ${result.count} reminders.`);
            }
        } catch (error) {
            alert('Failed to send reminders');
        } finally {
            setProcessingBulk(false);
        }
    };

    // Local search for UI responsiveness, though backend supports more
    const filteredInvoices = invoices.filter(inv =>
        inv.subscriber_name?.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toString().includes(search)
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoicing & Billing</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage monthly recurring bills and payment status.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSendReminders}
                            disabled={processingBulk}
                            className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-800 transition-all flex items-center gap-2"
                        >
                            {processingBulk ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                            Send Reminders
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                            <Download size={18} />
                            Export CSV
                        </button>
                        <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                            Generate Batch
                        </button>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden relative">
                    {/* Bulk Action Bar */}
                    {selectedIds.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-10 bg-indigo-600 text-white p-4 flex justify-between items-center animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-4">
                                <p className="font-bold">{selectedIds.length} invoices selected</p>
                                <div className="h-6 w-px bg-indigo-400" />
                                <button
                                    onClick={handleBulkPaid}
                                    disabled={processingBulk}
                                    className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
                                >
                                    {processingBulk ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Mark as Paid
                                </button>
                                <button
                                    onClick={handleBulkPDF}
                                    className="px-4 py-1.5 bg-indigo-500 text-white border border-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-400 transition-all flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    Download Bundle
                                </button>
                            </div>
                            <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-indigo-500 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-900/40">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find invoice or subscriber..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['', 'unpaid', 'paid', 'overdue'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${statusFilter === status
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                                        }`}
                                >
                                    {status || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest px-6 whitespace-nowrap">
                                <tr>
                                    <th className="px-4 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === invoices.length && invoices.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-4 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Subscriber</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Issue Date</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {loading && invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-indigo-600" size={32} />
                                            <p className="text-slate-400 font-medium tracking-wide">Syncing billing data...</p>
                                        </td>
                                    </tr>
                                ) : filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center text-slate-500 font-medium">No invoices found for this selection.</td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.includes(inv.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(inv.id)}
                                                    onChange={() => toggleSelect(inv.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-4 font-mono text-[12px] font-bold text-indigo-600 dark:text-indigo-400">
                                                #{inv.id.toString().padStart(6, '0')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                {inv.subscriber_name}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                                KES {parseFloat(inv.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(inv.billing_period_start).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">
                                                {new Date(inv.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${inv.status === 'paid'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : inv.status === 'overdue'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {inv.status === 'paid' && <CheckCircle2 size={10} />}
                                                    {inv.status === 'overdue' && <AlertCircle size={10} />}
                                                    {inv.status === 'unpaid' && <Clock size={10} />}
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button title="Download PDF" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                                        <Download size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
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
                                Page <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span> of <span className="text-slate-900 dark:text-white font-bold">{pagination.totalPages}</span>
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
            </main>
        </div>
    );
}
