'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Package, Wifi, Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    price: string;
}

interface Router {
    id: number;
    name: string;
}

interface AddSubscriberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddSubscriberModal = ({ isOpen, onClose, onSuccess }: AddSubscriberModalProps) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [routers, setRouters] = useState<Router[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        plan_id: '',
        router_id: '',
        mikrotik_username: '',
        mikrotik_password: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setSuccess(false);
            setError('');
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, routersRes] = await Promise.all([
                fetch('/api/plans'),
                fetch('/api/routers')
            ]);
            const plansData = await plansRes.json();
            const routersData = await routersRes.json();
            setPlans(plansData);
            setRouters(routersData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            const res = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setFormData({
                        full_name: '',
                        phone: '',
                        email: '',
                        plan_id: '',
                        router_id: '',
                        mikrotik_username: '',
                        mikrotik_password: ''
                    });
                }, 1500);
            } else {
                setError(result.error || 'Failed to add subscriber');
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register New Subscriber</h2>
                        <p className="text-sm text-slate-500">Provide client details and network credentials.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {success ? (
                        <div className="py-12 text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Success!</h3>
                            <p className="text-slate-500 mt-2">Subscriber registered & provisioned successfully.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Personal Information</h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Phone Number (e.g. 254...)"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-6 mb-2">Billing & Node</h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            required
                                            value={formData.plan_id}
                                            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                        >
                                            <option value="">Select Bandwidth Plan</option>
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - KES {p.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            required
                                            value={formData.router_id}
                                            onChange={(e) => setFormData({ ...formData, router_id: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                        >
                                            <option value="">Select Network Node (Router)</option>
                                            {routers.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* MikroTik Credentials */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">MikroTik Credentials</h3>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 space-y-4">
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="PPP/Hotspot Username"
                                            value={formData.mikrotik_username}
                                            onChange={(e) => setFormData({ ...formData, mikrotik_username: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="PPP/Hotspot Password"
                                            value={formData.mikrotik_password}
                                            onChange={(e) => setFormData({ ...formData, mikrotik_password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-indigo-500 font-medium">
                                        Note: These credentials will be used to automatically provision the user on the selected router node.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-800/50 font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Provisioning...
                                            </>
                                        ) : (
                                            'Confirm & Register'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
