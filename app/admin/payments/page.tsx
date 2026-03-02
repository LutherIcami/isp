'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LogPaymentModal } from '@/components/LogPaymentModal';
import { CreditCard, Search, ArrowDownRight, CheckCircle2, MoreVertical, DollarSign, Loader2, RefreshCw } from 'lucide-react';

interface Payment {
    id: number;
    transaction_id: string;
    subscriber_name: string;
    amount: string | number;
    payment_method: string;
    payment_date: string;
    status: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/payments');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPayments(data);
            } else {
                setPayments([]);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const filteredPayments = payments.filter(p =>
        p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.subscriber_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex flex-wrap justify-between items-end gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500">Financial Integrity</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Payment <span className="gradient-text">Manifest</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Track incoming revenue nodes and reconcile payment transactions.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchPayments}
                            className="p-4 bg-muted/20 hover:bg-muted border border-border/50 rounded-2xl text-muted-foreground hover:text-green-500 transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 text-white px-8 py-4 rounded-3xl text-sm font-black hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 flex items-center gap-3 active:scale-95"
                        >
                            <DollarSign size={20} />
                            Log Manual Payment
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Recent Revenue', value: `KES ${payments.reduce((acc, curr) => acc + parseFloat(curr.amount as string), 0).toLocaleString()}`, icon: <ArrowDownRight size={20} className="text-green-500" />, sub: 'All time processed', color: 'bg-green-500/10' },
                        { label: 'Transactions', value: payments.length.toString(), icon: <DollarSign size={20} className="text-primary" />, sub: 'Total records', color: 'bg-primary/10' },
                        { label: 'M-Pesa Share', value: '100%', icon: <CreditCard size={20} className="text-purple-500" />, sub: 'Main channel', color: 'bg-purple-500/10' },
                        { label: 'Pending Discrepancies', value: '0', icon: <CheckCircle2 size={20} className="text-amber-500" />, sub: 'Requires review', color: 'bg-amber-500/10' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-8 rounded-[2rem] border border-border/50 shadow-sm flex flex-col justify-between group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">{stat.sub}</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black text-foreground tracking-tighter mb-1">{stat.value}</h4>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-border/50 flex items-center gap-4 bg-muted/20">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search transaction ID or client node..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-background border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] px-10">
                                <tr>
                                    <th className="px-10 py-6">Transaction ID</th>
                                    <th className="px-10 py-6">Identity Node</th>
                                    <th className="px-10 py-6">Capital Value</th>
                                    <th className="px-10 py-6">Route</th>
                                    <th className="px-10 py-6">Timestamp Manifest</th>
                                    <th className="px-10 py-6 text-center">Integrity</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-10 py-32 text-center text-muted-foreground">
                                            <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
                                            <span className="font-black uppercase tracking-widest text-xs">Syncing Financial Ledger...</span>
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-10 py-32 text-center text-muted-foreground">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><DollarSign size={32} /></div>
                                            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Zero transactions in ledger.</span>
                                        </td>
                                    </tr>
                                ) : filteredPayments.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                                        <td className="px-10 py-6 font-mono text-xs font-black text-muted-foreground tracking-widest group-hover:text-primary transition-colors">{txn.transaction_id || `ID-${txn.id}`}</td>
                                        <td className="px-10 py-6 font-black text-foreground uppercase tracking-tight text-lg">{txn.subscriber_name || 'Anonymous Node'}</td>
                                        <td className="px-10 py-6 font-black text-foreground text-lg">KES {parseFloat(txn.amount as string).toLocaleString()}</td>
                                        <td className="px-10 py-6 text-muted-foreground text-xs">
                                            <span className="flex items-center gap-2 uppercase font-black tracking-widest border border-border/50 bg-muted/40 w-fit px-3 py-1.5 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse"></div>
                                                {txn.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-muted-foreground text-[10px] font-black uppercase tracking-widest">{new Date(txn.payment_date).toLocaleString()}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${txn.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {txn.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="p-3 hover:bg-muted/60 bg-muted/20 rounded-xl text-muted-foreground transition-all">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <LogPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchPayments}
                />
            </main>
        </div>
    );
}
