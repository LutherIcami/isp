import React from 'react';
import Link from 'next/link';
import {
    Wifi,
    CreditCard,
    Settings,
    LogOut,
    LayoutDashboard,
    HelpCircle,
    FileText
} from 'lucide-react';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'My Dashboard', href: '/subscriber-portal/dashboard' },
    { icon: <FileText size={20} />, label: 'My Invoices', href: '/subscriber-portal/invoices' },
    { icon: <Wifi size={20} />, label: 'Usage Activity', href: '/subscriber-portal/usage' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/subscriber-portal/settings' },
];

export default function SubscriberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            {/* Subscriber Sidebar */}
            <div className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            AirLink
                        </span>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Plan</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Pro Home (10M)</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 overflow-y-auto mt-2">
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
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors mb-2">
                        <HelpCircle size={20} />
                        <span className="font-medium">Get Support</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 ml-64">
                {children}
            </div>
        </div>
    );
}
