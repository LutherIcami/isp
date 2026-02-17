'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LogPaymentModal } from '@/components/LogPaymentModal';
import { CreditCard, Search, ArrowDownRight, ArrowUpRight, CheckCircle2, MoreVertical, DollarSign, Loader2, RefreshCw } from 'lucide-react';

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

    const fetchPayments = async () => {
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
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p =>
        p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.subscriber_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Transactions</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track all incoming revenue and reconcile payments.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchPayments}
                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 active:scale-95"
                        >
                            <DollarSign size={18} />
                            Log Manual Payment
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Recent Revenue', value: `KES ${payments.reduce((acc, curr) => acc + parseFloat(curr.amount as string), 0).toLocaleString()}`, icon: <ArrowDownRight size={20} className="text-green-500" />, sub: 'All time processed' },
                        { label: 'Transactions', value: payments.length.toString(), icon: <DollarSign size={20} className="text-indigo-500" />, sub: 'Total records' },
                        { label: 'M-Pesa Share', value: '100%', icon: <CreditCard size={20} className="text-purple-500" />, sub: 'Main channel' },
                        { label: 'Pending', value: '0', icon: <CheckCircle2 size={20} className="text-yellow-500" />, sub: 'Requires review' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-start shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-medium">{stat.sub}</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{stat.icon}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search transaction ID or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                                            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                            Fetching transactions...
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">No payments found.</td>
                                    </tr>
                                ) : filteredPayments.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">{txn.transaction_id || `ID-${txn.id}`}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{txn.subscriber_name || 'Anonymous'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">KES {parseFloat(txn.amount as string).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                            <span className="flex items-center gap-1.5 uppercase font-bold tracking-tighter">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                {txn.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-[11px] font-medium">{new Date(txn.payment_date).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${txn.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {txn.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
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
