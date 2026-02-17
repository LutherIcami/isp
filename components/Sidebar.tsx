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
    Settings,
    LogOut,
    LayoutDashboard,
    Package,
    Activity,
    ClipboardList
} from 'lucide-react';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: <Activity size={20} />, label: 'Network Health', href: '/admin/network' },
    { icon: <Users size={20} />, label: 'Subscribers', href: '/admin/subscribers' },
    { icon: <Package size={20} />, label: 'Plans', href: '/admin/plans' },
    { icon: <FileText size={20} />, label: 'Invoices', href: '/admin/invoices' },
    { icon: <CreditCard size={20} />, label: 'Payments', href: '/admin/payments' },
    { icon: <Wifi size={20} />, label: 'Routers', href: '/admin/routers' },
    { icon: <ClipboardList size={20} />, label: 'Activity Logs', href: '/admin/logs' },
    { icon: <BarChart3 size={20} />, label: 'Reports', href: '/admin/reports' },
];

export const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        A
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        AirLink ISP
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto mt-4">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors group"
                        >
                            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};
