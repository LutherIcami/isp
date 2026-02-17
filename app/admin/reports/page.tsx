'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    TrendingUp,
    Users,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';

interface RevenueStats {
    mrr: { month: string; revenue: number; invoice_count: number }[];
    growth: { month: string; new_subscribers: number }[];
    efficiency: { status: string; total_amount: number }[];
}

export default function ReportsPage() {
    const [data, setData] = useState<RevenueStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports/revenue')
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Fiscal Intelligence...</p>
            </div>
        );
    }

    const totalInvoiced = data?.efficiency.reduce((acc, curr) => acc + parseFloat(curr.total_amount as any), 0) || 0;
    const totalPaid = data?.efficiency.find(e => e.status === 'paid')?.total_amount || 0;
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue & Growth Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400">Financial insights and subscriber acquisition trends.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Collection Efficiency Card */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl lg:col-span-1">
                        <div className="flex justify-between items-center mb-8">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                <PieChart size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collection Rate</span>
                        </div>

                        <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-100 dark:text-slate-800"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={552.9}
                                    strokeDashoffset={552.9 - (552.9 * collectionRate) / 100}
                                    className="text-indigo-600 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(collectionRate)}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">collected</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500 font-medium">Monthly Invoiced</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">KES {totalInvoiced.toLocaleString()}</p>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600" style={{ width: `${collectionRate}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* MRR Trend Chart (CSS Sparklines) */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl lg:col-span-2">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">MRR Growth</h3>
                                <p className="text-xs text-slate-500">Monthly Recurring Revenue trends vs Last Year</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-48 gap-4 mb-8">
                            {data?.mrr.map((m, i) => {
                                const maxRev = Math.max(...data.mrr.map(x => x.revenue));
                                const height = (m.revenue / maxRev) * 100;
                                return (
                                    <div key={m.month} className="flex-1 group relative flex flex-col items-center gap-4">
                                        <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            KES {Math.round(m.revenue / 1000)}k
                                        </div>
                                        <div
                                            className="w-full bg-indigo-500/10 group-hover:bg-indigo-500/20 rounded-t-xl transition-all duration-700 ease-out-expo"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-xl transition-all duration-1000 delay-150"
                                                style={{ height: i === data.mrr.length - 1 ? '100%' : '60%' }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 rotate-[-45deg] origin-left ml-2 whitespace-nowrap">
                                            {m.month.split(' ')[0]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sub-grid: Growth & Plans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Subscriber Growth */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl text-violet-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Acquisition Metrics</h4>
                                <p className="text-xs text-slate-500">New subscribers joined per month</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {data?.growth.map((g) => (
                                <div key={g.month} className="flex items-center gap-4">
                                    <span className="w-16 text-[10px] font-black uppercase tracking-widest text-slate-400">{g.month.split(' ')[0]}</span>
                                    <div className="flex-1 h-3 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-violet-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${(g.new_subscribers / Math.max(...data.growth.map(x => x.new_subscribers))) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">+{g.new_subscribers}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: 'Avg Ticket', value: 'KES 2,450', icon: <DollarSign size={20} />, sub: 'Per Sub', color: 'indigo' },
                            { label: 'Churn Rate', value: '1.2%', icon: <ArrowDownRight size={20} />, sub: 'Monthly', color: 'rose' },
                            { label: 'Active Pipeline', value: 'KES 2.4M', icon: <TrendingUp size={20} />, sub: 'Total Value', color: 'emerald' },
                            { label: 'Next Cycle', value: '14 Days', icon: <Calendar size={20} />, sub: 'Expected', color: 'amber' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                        stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                            stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-amber-50 text-amber-600'
                                    }`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
