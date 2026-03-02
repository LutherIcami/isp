'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    FileText, Download, Search, MoreVertical,
    Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
    Loader2, X, Bell, TrendingUp, Wallet,
    ArrowUpRight, RefreshCcw, ShieldAlert, Cpu
} from 'lucide-react';

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

interface BillingStats {
    monthly_revenue: string;
    pending_collections: string;
    overdue_count: number;
    paid_today: number;
    collection_rate: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [processingBulk, setProcessingBulk] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/billing/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch billing stats:', error);
        }
    }, []);

    const runBilling = async () => {
        if (!confirm('Execute automated billing cycle for all due subscribers?')) return;
        setIsScanning(true);
        try {
            const res = await fetch('/api/billing', { method: 'POST' });
            const result: { processed: number; suspended: number } = await res.json();
            alert(`Cycle complete. Processed ${result.processed} invoices and ${result.suspended} suspensions.`);
            fetchInvoices();
            fetchStats();
        } catch {
            alert('Billing cycle execution failed.');
        } finally {
            setIsScanning(false);
        }
    };

    const fetchInvoices = useCallback(async () => {
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
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchInvoices();
        fetchStats();
        setSelectedIds([]);
    }, [fetchInvoices, fetchStats]);

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
                setSelectedIds([]);
                fetchInvoices();
                fetchStats();
            }
        } catch {
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
        if (!confirm('Deliver high-priority SMS/Email reminders to all pending clients?')) return;
        try {
            setProcessingBulk(true);
            const res = await fetch('/api/notifications/reminders', { method: 'POST' });
            const result = await res.json();
            if (res.ok) {
                alert(`Broadcast successful. Handled ${result.count} notification triggers.`);
            }
        } catch {
            alert('Notification broadcast failed');
        } finally {
            setProcessingBulk(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.subscriber_name?.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toString().includes(search)
    );

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden selection:bg-primary/20">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex flex-wrap justify-between items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Billing <span className="gradient-text">Manifest</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Real-time financial synchronization and automated collection oversight.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={runBilling}
                            disabled={isScanning}
                            className="bg-secondary text-secondary-foreground border border-border px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-3 shadow-xl"
                        >
                            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Cpu size={16} />}
                            {isScanning ? 'Synchronizing Node Cycles...' : 'Execute Automated Engine'}
                        </button>
                        <button
                            onClick={handleSendReminders}
                            disabled={processingBulk}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Bell size={20} />
                            Broadcast Reminders
                        </button>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-l-4 border-l-primary/30">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 block opacity-40">Monthly Velocity</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-foreground group-hover:gradient-text transition-all tracking-tighter tabular-nums">
                                {stats ? `KES ${parseInt(stats.monthly_revenue).toLocaleString()}` : '...'}
                            </h3>
                            <div className="text-green-500 flex items-center text-[10px] font-black gap-1">
                                <TrendingUp size={12} /> +12%
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-l-4 border-l-amber-500/30">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 block opacity-40">Pending Manifest</span>
                        <h3 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">
                            {stats ? `KES ${parseInt(stats.pending_collections).toLocaleString()}` : '...'}
                        </h3>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-l-4 border-l-indigo-500/30">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 block opacity-40">Efficiency Rate</span>
                        <div className="flex items-center gap-4">
                            <h3 className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                {stats ? `${stats.collection_rate}%` : '...'}
                            </h3>
                            <div className="flex-1 h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 opacity-60"
                                    style={{ width: `${stats?.collection_rate || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-l-4 border-l-red-500/30">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 block opacity-40">Critical Faults</span>
                        <h3 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">
                            {stats?.overdue_count || 0}
                        </h3>
                    </div>
                </div>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden relative mb-10">
                    {/* Bulk Action Bar */}
                    {selectedIds.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-20 bg-primary p-6 flex justify-between items-center animate-reveal">
                            <p className="text-primary-foreground font-black text-xs uppercase tracking-[0.3em]">{selectedIds.length} Debit Nodes Targeted</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleBulkPaid}
                                    disabled={processingBulk}
                                    className="bg-white text-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    {processingBulk ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                                    Mark as Reconciled
                                </button>
                                <button
                                    onClick={handleBulkPDF}
                                    className="bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-foreground/30 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <FileText size={16} />
                                    Bundle Export
                                </button>
                                <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-black/10 rounded-xl">
                                    <X size={20} className="text-primary-foreground" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-6 border-b border-border/50 flex flex-wrap gap-6 items-center justify-between bg-muted/20">
                        <div className="relative w-full max-w-sm group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Find node record or client..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-background/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-3">
                            {['', 'unpaid', 'paid', 'overdue'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === status
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-background hover:bg-muted text-muted-foreground border border-border/50'
                                        }`}
                                >
                                    {status || 'Universal'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] px-10 whitespace-nowrap">
                                <tr>
                                    <th className="px-10 py-6 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === invoices.length && invoices.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-5 h-5 rounded-lg border-border bg-background text-primary focus:ring-primary/20 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-10 py-6">Trace ID</th>
                                    <th className="px-10 py-6">Beneficiary</th>
                                    <th className="px-10 py-6">Value</th>
                                    <th className="px-10 py-6">Cycle Path</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6 text-right">Manifest Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading && invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Collection Manifest...</p>
                                        </td>
                                    </tr>
                                ) : filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><ShieldAlert size={32} /></div>
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Zero financial records detected in this scope.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className={`hover:bg-primary/5 transition-all group cursor-pointer ${selectedIds.includes(inv.id) ? 'bg-primary/5' : ''}`}>
                                            <td className="px-10 py-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(inv.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelect(inv.id);
                                                    }}
                                                    className="w-5 h-5 rounded-lg border-border bg-background text-primary focus:ring-primary/20 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-10 py-6 font-mono text-[11px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                                                INV-{inv.id.toString().padStart(6, '0')}
                                            </td>
                                            <td className="px-10 py-6 text-foreground">
                                                <p className="font-black text-lg tracking-tight mb-1 group-hover:gradient-text transition-all">{inv.subscriber_name || 'Generic Client'}</p>
                                                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                                    <ArrowUpRight size={10} /> Active Deployment
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="font-black text-xl text-foreground tabular-nums tracking-tighter">KES {parseFloat(inv.amount).toLocaleString()}</p>
                                                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest opacity-60">Verified Amount</div>
                                            </td>
                                            <td className="px-10 py-6 text-muted-foreground">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black uppercase tracking-tight text-foreground/70">DUE: {new Date(inv.due_date).toLocaleDateString()}</p>
                                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                                                        <Clock size={10} /> {new Date(inv.billing_period_start).toLocaleDateString()} CYCLE
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 w-fit border ${inv.status === 'paid'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : inv.status === 'overdue'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {inv.status === 'paid' && <CheckCircle2 size={10} />}
                                                    {inv.status === 'overdue' && <AlertCircle size={10} />}
                                                    {inv.status === 'unpaid' && <RefreshCcw size={10} />}
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        className="p-3 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-primary rounded-2xl transition-all"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        className="p-3 bg-muted/20 hover:bg-muted/40 text-muted-foreground rounded-2xl transition-all"
                                                    >
                                                        <MoreVertical size={18} />
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
                        <div className="p-8 bg-muted/10 border-t border-border/50 flex flex-wrap justify-between items-center gap-6">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
                                Segment {currentPage} of {pagination.totalPages} Manifests
                            </span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-background border border-border/50 disabled:opacity-30 font-black text-xs uppercase tracking-widest hover:bg-muted transition-all"
                                >
                                    <ChevronLeft size={16} />
                                    Prior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                    disabled={currentPage === pagination.totalPages || loading}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-background border border-border/50 disabled:opacity-30 font-black text-xs uppercase tracking-widest hover:bg-muted transition-all"
                                >
                                    Proceed
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
