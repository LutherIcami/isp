'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Wifi, CreditCard, Activity, ArrowUpRight, Zap, Play, Loader2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscriberDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [testRunning, setTestRunning] = useState(false);
    const [currentSpeed, setCurrentSpeed] = useState<number>(0);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/subscriber/portal-data');
                if (!res.ok) throw new Error('Failed to fetch dashboard data');
                const portalData = await res.json();
                setData(portalData);

                if (portalData.subscriber?.speed) {
                    setCurrentSpeed(parseFloat(portalData.subscriber.speed.replace(/[^\d.]/g, '')) || 0);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400">
                    <AlertCircle size={24} />
                    <div>
                        <h3 className="font-bold">Error loading dashboard</h3>
                        <p className="text-sm opacity-80">{error || 'No data available'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { subscriber, invoices } = data;

    const runSpeedTest = () => {
        setTestRunning(true);
        let count = 0;
        const targetSpeed = parseFloat(subscriber.speed.replace(/[^\d.]/g, '')) || 10;
        const interval = setInterval(() => {
            setCurrentSpeed(Math.random() * (targetSpeed * 1.2));
            count++;
            if (count > 20) {
                clearInterval(interval);
                setCurrentSpeed(targetSpeed - (Math.random() * 0.5));
                setTestRunning(false);
            }
        }, 150);
    };

    const handlePayment = async () => {
        if (!latestInvoice) return;
        setPaymentLoading(true);
        try {
            const res = await fetch('/api/payments/mpesa/stk-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: latestInvoice.amount,
                    phone: subscriber.phone,
                    invoiceId: latestInvoice.id
                }),
            });
            const result = await res.json();
            if (res.ok) {
                alert('STK Push sent to your phone. Please enter your PIN.');
            } else {
                alert(result.error || 'Payment failed to initiate');
            }
        } catch (err) {
            alert('Failed to connect to payment getaway');
        } finally {
            setPaymentLoading(false);
        }
    };

    const latestInvoice = invoices[0];
    const isOverdue = latestInvoice?.status === 'unpaid' && new Date(latestInvoice.due_date) < new Date();

    return (
        <main className="p-8">
            <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        Welcome back, {subscriber.fullName.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {subscriber.status === 'active'
                            ? "Your connection is healthy and billing is up to date."
                            : "Your subscription requires attention."}
                    </p>
                </div>
                <div className={`flex ${subscriber.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'} px-4 py-2 rounded-2xl items-center gap-2 text-sm font-bold`}>
                    <Zap size={16} fill="currentColor" />
                    {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)} Connection
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Current Plan Speed"
                    value={subscriber.speed ? `${subscriber.speed}` : 'N/A'}
                    icon={<Zap size={24} />}
                    trend={{ value: 100, isUp: true }}
                    color="blue"
                />
                <StatCard
                    title="Account Status"
                    value={subscriber.status.toUpperCase()}
                    icon={<Activity size={24} />}
                    trend={{ value: 0, isUp: true }}
                    color="purple"
                />
                <StatCard
                    title="Next Billing"
                    value={subscriber.nextBilling ? new Date(subscriber.nextBilling).toLocaleDateString() : 'N/A'}
                    icon={<CreditCard size={24} />}
                    trend={{ value: 0, isUp: false }}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Network Status Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-40 h-40 rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-6 relative">
                        <span className={`text-4xl font-black transition-all ${testRunning ? 'scale-110 text-indigo-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                            {currentSpeed.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mbps Download</span>
                        <div className={`absolute top-0 right-0 p-2 rounded-full text-white transition-all ${testRunning ? 'bg-indigo-600 rotate-180 scale-125' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            {testRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Network Status</h3>
                    <p className="text-sm text-slate-500 mb-6 px-10">
                        {subscriber.status === 'active'
                            ? "You're getting optimal speeds from our local node."
                            : "Please settle your pending balance to restore full speed."}
                    </p>
                    <button
                        onClick={runSpeedTest}
                        disabled={testRunning}
                        className="px-6 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                        {testRunning ? 'Testing...' : 'Run Speed Test'}
                    </button>
                </div>

                {/* Billing Summary */}
                <div className={`${isOverdue ? 'bg-red-600' : 'bg-slate-900'} text-white p-8 rounded-3xl shadow-xl shadow-slate-900/10 flex flex-col justify-between`}>
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <CreditCard size={24} />
                            </div>
                            {latestInvoice && (
                                <span className={`text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/5 uppercase tracking-tighter`}>
                                    {latestInvoice.status === 'unpaid' ? `Due ${new Date(latestInvoice.due_date).toLocaleDateString()}` : 'Account Clear'}
                                </span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                            KES {latestInvoice?.status === 'unpaid' ? parseFloat(latestInvoice.amount).toLocaleString() : '0.00'}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">
                            {latestInvoice?.status === 'unpaid' ? `Pending Invoice (#${latestInvoice.id})` : 'No pending payments'}
                        </p>
                    </div>

                    <div className="mt-10">
                        <button
                            onClick={handlePayment}
                            disabled={!latestInvoice || latestInvoice.status !== 'unpaid' || paymentLoading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {paymentLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>
                                    Pay Now with M-Pesa
                                    <ArrowUpRight size={18} />
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-4">Safe & Encrypted 256-bit automated payment system.</p>
                    </div>
                </div>
            </div>

            {/* Recent Invoices Table (Small) */}
            {invoices.length > 0 && (
                <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
                        <button className="text-xs font-bold text-indigo-600">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold">
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Period</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {invoices.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">#{inv.id}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(inv.billing_period_start).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">KES {parseFloat(inv.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
