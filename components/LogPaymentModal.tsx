'use client';

import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Hash, CreditCard, Loader2, CheckCircle2, Ticket } from 'lucide-react';

interface Subscriber {
    id: number;
    full_name: string;
}

interface Invoice {
    id: number;
    amount: string;
    due_date: string;
}

interface LogPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const LogPaymentModal = ({ isOpen, onClose, onSuccess }: LogPaymentModalProps) => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        subscriber_id: '',
        invoice_id: '',
        amount: '',
        payment_method: 'MPESA',
        transaction_id: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchSubscribers();
            setSuccess(false);
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.subscriber_id) {
            fetchInvoices(formData.subscriber_id);
        } else {
            setInvoices([]);
        }
    }, [formData.subscriber_id]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/subscribers?limit=100'); // Get top 100 for selection
            const result = await res.json();
            if (result.data) {
                setSubscribers(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async (subscriberId: string) => {
        try {
            const res = await fetch(`/api/invoices?subscriberId=${subscriberId}&status=unpaid`);
            const result = await res.json();
            if (result.data) {
                setInvoices(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        }
    };

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(i => i.id.toString() === invoiceId);
        setFormData({
            ...formData,
            invoice_id: invoiceId,
            amount: invoice ? parseFloat(invoice.amount).toString() : formData.amount
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setFormData({
                        subscriber_id: '',
                        invoice_id: '',
                        amount: '',
                        payment_method: 'MPESA',
                        transaction_id: ''
                    });
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to log payment');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log Manual Payment</h2>
                        <p className="text-sm text-slate-500">Record payments received outside the automated system.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {success ? (
                        <div className="py-8 text-center animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Recorded</h3>
                            <p className="text-slate-500 mt-2 text-sm">Invoice updated and payment receipt logged.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Subscriber Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Subscriber</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        required
                                        value={formData.subscriber_id}
                                        onChange={(e) => setFormData({ ...formData, subscriber_id: e.target.value, invoice_id: '' })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                    >
                                        <option value="">Find subscriber...</option>
                                        {subscribers.map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Invoice Selection */}
                            {formData.subscriber_id && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Unpaid Invoice (Optional)</label>
                                    <div className="relative">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            value={formData.invoice_id}
                                            onChange={(e) => handleInvoiceChange(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                        >
                                            <option value="">No specific invoice (Advance/New)</option>
                                            {invoices.map(i => (
                                                <option key={i.id} value={i.id}>#{i.id.toString().padStart(6, '0')} - KES {parseFloat(i.amount).toLocaleString()} (Due: {new Date(i.due_date).toLocaleDateString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Amount Paid</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Method</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            required
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none uppercase font-bold"
                                        >
                                            <option value="MPESA">M-PESA</option>
                                            <option value="CASH">Cash</option>
                                            <option value="BANK">Bank Transfer</option>
                                            <option value="CHEQUE">Cheque</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Transaction ID / Reference</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. QXJ829KS..."
                                        value={formData.transaction_id}
                                        onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono uppercase"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-800/50 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Record Payment'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
