'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wifi, ArrowRight, ShieldCheck, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                username: email,
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password. Please try again.');
            } else {
                const session = await getSession() as any;
                if (session?.user?.role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (session?.user?.role === 'subscriber') {
                    router.push('/subscriber-portal/dashboard');
                } else {
                    router.push('/');
                }
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex selection:bg-primary/20 selection:text-primary overflow-hidden">
            {/* Left Panel: Branding & Marketing */}
            <div className="hidden lg:flex lg:w-[45%] bg-primary p-16 flex-col justify-between relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400/20 blur-[100px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-20 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl transition-transform group-hover:rotate-12">
                            <Wifi size={28} />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">AirLink<span className="text-white/60 italic">OS</span></span>
                    </Link>

                    <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter mb-10 animate-reveal">
                        The Operating System for <br />
                        <span className="text-white/60">Digital Pioneers.</span>
                    </h2>

                    <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
                        {[
                            'Automated Smart Billing Reconciliations',
                            'Real-time MikroTik Bandwidth Control',
                            'Enterprise-Grade Security Protocols'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/80 font-medium">
                                <CheckCircle2 size={20} className="text-white" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10 animate-reveal" style={{ animationDelay: '0.2s' }}>
                    <div>
                        <p className="text-3xl font-black text-white tracking-tighter">1.2k+</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Nodes</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white tracking-tighter">99.9%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Uptime SLA</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-3xl">
                <div className="w-full max-w-lg glass-card p-12 rounded-[2.5rem] shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />

                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-3">Welcome Back</h1>
                        <p className="text-muted-foreground font-medium">Elevate your network management today.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-reveal">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 ml-1">Identity (Email)</label>
                            <div className="group relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-background/50 border border-border rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-semibold"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Access Key (Password)</label>
                                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70">Reset?</Link>
                            </div>
                            <div className="group relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-background/50 border border-border rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-semibold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-1">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary/20 bg-background"
                            />
                            <label htmlFor="remember" className="text-sm font-bold text-muted-foreground selection:hidden cursor-pointer">Stay authenticated for 30 cycles</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transform active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    Authorize Access
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            New operator? <Link href="/register" className="font-black text-primary hover:underline">Provision account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
