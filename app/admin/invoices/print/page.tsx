'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Printer, Wifi } from 'lucide-react';

interface FullInvoice {
    id: number;
    subscriber_name: string;
    subscriber_email: string;
    subscriber_phone: string;
    amount: string;
    billing_period_start: string;
    billing_period_end: string;
    due_date: string;
    status: string;
    plan_name: string;
    download_speed: string;
    upload_speed: string;
    created_at: string;
}

export default function InvoicePrintPage() {
    const searchParams = useSearchParams();
    const ids = searchParams.get('ids');
    const [invoices, setInvoices] = useState<FullInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ids) {
            fetch(`/api/invoices/export?ids=${ids}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setInvoices(data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [ids]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Preparing your invoice bundle...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen p-4 md:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
                {/* Print Control FAB */}
                <button
                    onClick={() => window.print()}
                    className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 print:hidden flex items-center gap-2"
                >
                    <Printer size={24} />
                    <span className="font-bold">Print Bundle</span>
                </button>

                {invoices.map((inv, index) => (
                    <div key={inv.id} className="bg-white p-8 md:p-12 shadow-sm rounded-none border border-slate-200 print:border-none print:shadow-none print:m-0 print:w-full page-break">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                    <Wifi size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tighter text-slate-900">SKYNET WIFI</h1>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">High Speed Internet Provider</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-slate-200 uppercase pointer-events-none mb-1">INVOICE</h2>
                                <p className="font-mono text-sm font-bold text-indigo-600">#{inv.id.toString().padStart(6, '0')}</p>
                            </div>
                        </div>

                        {/* Bill To / Info Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Bill To:</p>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{inv.subscriber_name}</h3>
                                <p className="text-slate-500 text-sm">{inv.subscriber_phone}</p>
                                <p className="text-slate-500 text-sm">{inv.subscriber_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Invoice Details:</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-600">Issued: <span className="font-bold text-slate-900">{new Date(inv.created_at).toLocaleDateString()}</span></p>
                                    <p className="text-sm text-slate-600">Due Date: <span className="font-bold text-slate-900">{new Date(inv.due_date).toLocaleDateString()}</span></p>
                                    <p className="text-sm text-slate-600">Status: <span className={`font-black uppercase text-[10px] ${inv.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{inv.status}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-900">Description</th>
                                        <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Service Period</th>
                                        <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-6">
                                            <p className="font-bold text-slate-900">Monthly Internet Subscription</p>
                                            <p className="text-xs text-slate-500">{inv.plan_name} ({inv.download_speed}/{inv.upload_speed})</p>
                                        </td>
                                        <td className="py-6 text-center text-sm text-slate-600">
                                            {new Date(inv.billing_period_start).toLocaleDateString()} - {new Date(inv.billing_period_end).toLocaleDateString()}
                                        </td>
                                        <td className="py-6 text-right font-bold text-slate-900 font-mono">
                                            KES {parseFloat(inv.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Summary / Footer */}
                        <div className="flex justify-between items-end">
                            <div className="bg-slate-50 p-6 rounded-2xl max-w-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Memo:</p>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    Thank you for your business! Please ensure payment is made by the due date to avoid service interruption.
                                    Payments can be made via M-PESA Till Number: 554433.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-12 mb-4">
                                    <p className="text-slate-500 font-bold">Total Amount</p>
                                    <p className="text-3xl font-black text-indigo-600 font-mono">KES {parseFloat(inv.amount).toLocaleString()}</p>
                                </div>
                                <div className="h-1 w-full bg-slate-900 mb-1" />
                                <div className="h-0.5 w-full bg-slate-900" />
                            </div>
                        </div>

                        {/* Page break for printing */}
                        {index < invoices.length - 1 && (
                            <style jsx global>{`
                                @media print {
                                    .page-break { page-break-after: always; }
                                }
                            `}</style>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
