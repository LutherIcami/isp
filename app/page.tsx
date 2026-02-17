import Link from 'next/link';
import { Wifi, Shield, Zap, CircleDollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Hero Section */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold dark:text-white">AirLink ISP</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Login</Link>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-600/20">Go to Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-40">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            The Complete <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              ISP Management OS
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate your subscriber billing, bandwidth control, and network health
            from a single, premium cloud interface.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Client Portal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Smart Bandwidth</h3>
            <p className="text-slate-600 dark:text-slate-400">Integrated MikroTik API control for real-time speed limiting and subscriber management.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
              <CircleDollarSign size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Auto Billing</h3>
            <p className="text-slate-600 dark:text-slate-400">Automated recurring invoices, grace periods, and M-Pesa/Bank payment reconciliations.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Enterprise Security</h3>
            <p className="text-slate-600 dark:text-slate-400">Role-based access control (RBAC) ensure your network data stays secure and private.</p>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
        © 2026 AirLink ISP Management System. All rights reserved.
      </footer>
    </div>
  );
}
