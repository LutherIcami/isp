'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    BarChart3,
    Users,
    Wifi,
    CreditCard,
    FileText,
    LogOut,
    LayoutDashboard,
    Package,
    Activity,
    ClipboardList,
    LifeBuoy,
    Shield,
    Megaphone
} from 'lucide-react';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: <Activity size={20} />, label: 'Network Health', href: '/admin/network' },
    { icon: <Users size={20} />, label: 'Subscribers', href: '/admin/subscribers' },
    { icon: <Package size={20} />, label: 'Plans', href: '/admin/plans' },
    { icon: <FileText size={20} />, label: 'Invoices', href: '/admin/invoices' },
    { icon: <CreditCard size={20} />, label: 'Payments', href: '/admin/payments' },
    { icon: <LifeBuoy size={20} />, label: 'Support', href: '/admin/support' },
    { icon: <Wifi size={20} />, label: 'Routers', href: '/admin/routers' },
    { icon: <ClipboardList size={20} />, label: 'Activity Logs', href: '/admin/logs' },
    { icon: <Shield size={20} />, label: 'Firewall', href: '/admin/firewall' },
    { icon: <Megaphone size={20} />, label: 'Broadcast', href: '/admin/broadcast' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/admin/reports' },
];

export const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-background/50 backdrop-blur-xl border-r border-border/50 flex flex-col fixed left-0 top-0 z-20 selection:bg-primary/20">
            <div className="p-8">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-primary/20 shadow-lg shadow-primary/5 transition-transform group-hover:scale-110">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter gradient-text">
                            AirLink OS
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Admin Node</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto space-y-8 mt-4">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 mb-4">Manifest</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <span className="group-hover:text-primary transition-colors relative z-10">
                                {item.icon}
                            </span>
                            <span className="font-bold text-sm tracking-tight relative z-10">{item.label}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>

                <div className="px-4">
                    <div className="glass-card p-4 rounded-3xl border-primary/10 bg-primary/5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">System Load</p>
                        <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/3 animate-shimmer" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-6 border-t border-border/50 bg-muted/20">
                <button
                    onClick={() => signOut({ redirect: true, callbackUrl: typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login' })}
                    className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out Terminal
                </button>
            </div>
        </div>
    );
};
