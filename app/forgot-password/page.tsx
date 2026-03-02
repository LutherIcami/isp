'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Something went wrong');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl">A</div>
                        <span className="text-2xl font-bold text-white tracking-tight">AirLink ISP</span>
                    </div>
                    <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Secure <br /> access to your <br /> dashboard.
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Recover your account password easily. If you have any trouble, our support team is ready to help.
                    </p>
                </div>

                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                        <p className="text-slate-500 dark:text-slate-400">Enter your email and we'll send you a recovery link.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                We've sent a password reset link to <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                Back to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1 uppercase tracking-widest text-[10px]">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@airlink.com"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transform active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
                            </button>

                            <Link href="/login" className="block text-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                Cancel and return to login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
