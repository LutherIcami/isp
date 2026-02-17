'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    download_speed: string;
    upload_speed: string;
    price: string;
    billing_cycle: string;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans');
                const data = await res.json();
                setPlans(data);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bandwidth Plans</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your ISP packages and bandwidth profiles.</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                        <Plus size={18} />
                        Create New Plan
                    </button>
                </header>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search plans..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-medium text-slate-500">
                            <span>Total Plans: {plans.length}</span>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Plan Name</th>
                                <th className="px-6 py-4">Bandwidth (D/U)</th>
                                <th className="px-6 py-4">Price (KES)</th>
                                <th className="px-6 py-4">Billing Cycle</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading plans...</td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">No plans created yet.</td>
                                </tr>
                            ) : plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                <Package size={16} />
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{plan.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold mr-2">Down</span>
                                        {plan.download_speed} /
                                        <span className="bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ml-2 mr-2">Up</span>
                                        {plan.upload_speed}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                        {parseFloat(plan.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                                            {plan.billing_cycle}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
