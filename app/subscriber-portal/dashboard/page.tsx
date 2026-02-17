import React from 'react';
import { StatCard } from '@/components/StatCard';
import { Wifi, CreditCard, Activity, ArrowUpRight, Zap, Play } from 'lucide-react';

export default function SubscriberDashboard() {
    return (
        <main className="p-8">
            <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Samuel!</h1>
                    <p className="text-slate-500 dark:text-slate-400">Your connection is healthy and billing is up to date.</p>
                </div>
                <div className="flex bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-2xl items-center gap-2 text-sm font-bold">
                    <Zap size={16} fill="currentColor" />
                    Active Connection
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Current Plan Speed"
                    value="10 Mbps"
                    icon={<Zap size={24} />}
                    trend={{ value: 100, isUp: true }}
                    color="blue"
                />
                <StatCard
                    title="Data Used (This Month)"
                    value="124.5 GB"
                    icon={<Activity size={24} />}
                    trend={{ value: 15, isUp: true }}
                    color="purple"
                />
                <StatCard
                    title="Days Until Expiry"
                    value="14 Days"
                    icon={<CreditCard size={24} />}
                    trend={{ value: 45, isUp: false }}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Speed Test Mirror Placeholder */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-40 h-40 rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-6 relative">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">9.8</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mbps Download</span>
                        <div className="absolute top-0 right-0 p-2 bg-indigo-600 rounded-full text-white">
                            <Play size={14} fill="white" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Network Status</h3>
                    <p className="text-sm text-slate-500 mb-6 px-10">You're getting optimal speeds from our Nairobi CBD Node.</p>
                    <button className="px-6 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                        Run Full Speed Test
                    </button>
                </div>

                {/* Quick Payment Card */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/10 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <CreditCard size={24} />
                            </div>
                            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/5 uppercase tracking-tighter">Due Mar 1, 2026</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">KES 2,500.00</h3>
                        <p className="text-slate-400 text-sm font-medium">Monthly Renewal (Pro Plan)</p>
                    </div>

                    <div className="mt-10">
                        <button className="w-full py-4 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                            Pay Now with M-Pesa
                            <ArrowUpRight size={18} />
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-4">Safe & Encrypted 256-bit automated payment system.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
