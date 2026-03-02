'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    LifeBuoy, Search, Clock,
    CheckCircle2, Plus, X,
    Loader2, ChevronRight, User, Send
} from 'lucide-react';

interface Ticket {
    id: number;
    subscriber_id: number;
    subscriber_name: string;
    subscriber_phone: string;
    subject: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
}

export default function SupportManifestPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const statusParam = statusFilter ? `?status=${statusFilter}` : '';
            const res = await fetch(`/api/admin/tickets${statusParam}`);
            const data = await res.json();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.subscriber_name.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search)
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'medium': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-10 flex flex-wrap justify-between items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Support <span className="gradient-text">Manifest</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Real-time client technical report oversight and synchronization.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95">
                            <Plus size={20} />
                            Log New Report
                        </button>
                    </div>
                </header>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden relative mb-10 min-h-[600px]">
                    <div className="p-6 border-b border-border/50 flex flex-wrap gap-6 items-center justify-between bg-muted/20">
                        <div className="relative w-full max-w-sm group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search reports or clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-background/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-3">
                            {['', 'open', 'in-progress', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === status
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-background hover:bg-muted text-muted-foreground border border-border/50'
                                        }`}
                                >
                                    {status || 'Universal'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] px-10 whitespace-nowrap">
                                <tr>
                                    <th className="px-10 py-6">Incident ID</th>
                                    <th className="px-10 py-6">Beneficiary</th>
                                    <th className="px-10 py-6">Manifest Content</th>
                                    <th className="px-10 py-6">Severity</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Support Manifest...</p>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30"><LifeBuoy size={32} /></div>
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Zero reports detected in this scope.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="hover:bg-primary/5 transition-all group cursor-pointer"
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                        >
                                            <td className="px-10 py-6 font-mono text-[11px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                                                TR-{ticket.id.toString().padStart(6, '0')}
                                            </td>
                                            <td className="px-10 py-6 text-foreground">
                                                <p className="font-black text-lg tracking-tight mb-1 group-hover:gradient-text transition-all">{ticket.subscriber_name}</p>
                                                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                                    <User size={10} /> {ticket.subscriber_phone}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 max-w-sm">
                                                <p className="font-black text-foreground truncate uppercase">{ticket.subject}</p>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                                    {new Date(ticket.created_at).toLocaleDateString()} manifest node
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 w-fit border ${ticket.status === 'open'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : ticket.status === 'in-progress'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    }`}>
                                                    {ticket.status === 'open' && <Clock size={10} />}
                                                    {ticket.status === 'in-progress' && <Loader2 size={10} className="animate-spin" />}
                                                    {ticket.status === 'resolved' && <CheckCircle2 size={10} />}
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button className="p-3 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-primary rounded-2xl transition-all">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ticket Detail Drawer Overlay */}
                {selectedTicketId && (
                    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
                        <div
                            className="absolute inset-0 bg-background/40 backdrop-blur-xl"
                            onClick={() => setSelectedTicketId(null)}
                        ></div>
                        <TicketDetail
                            id={selectedTicketId}
                            onClose={() => setSelectedTicketId(null)}
                            onUpdate={fetchTickets}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

interface TicketMessage {
    id: number;
    message: string;
    is_admin_reply: boolean;
    created_at: string;
}

interface TicketDetailData {
    ticket: Ticket & { description: string };
    messages: TicketMessage[];
}

function TicketDetail({ id, onClose, onUpdate }: { id: number, onClose: () => void, onUpdate: () => void }) {
    const [data, setData] = useState<TicketDetailData | null>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/tickets/${id}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            await fetch(`/api/admin/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply, admin_id: 1 }) // Hardcoded admin for now
            });
            setReply('');
            fetchDetail();
            onUpdate();
        } catch {
            alert('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="w-full max-w-2xl bg-card border-l border-border/50 h-full flex items-center justify-center relative z-10 animate-slide-in-right">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const { ticket, messages } = data;

    return (
        <div className="w-full max-w-2xl bg-card border-l border-border/50 h-full flex flex-col relative z-10 animate-slide-in-right p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.2)]">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic gradient-text">Incident {ticket.id}</h2>
                    <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest mt-1 opacity-50">{ticket.category} category manifest</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl bg-muted/20 text-muted-foreground transition-all">
                    <X size={20} />
                </button>
            </header>

            <div className="glass-card p-6 rounded-3xl mb-8 bg-muted/10">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Diagnostic Summary</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ticket.priority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        }`}>{ticket.priority} severity</span>
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 uppercase leading-tight">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 mb-8 scrollbar-hide">
                <div className="text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Conversation Manifest Sync</span>
                </div>
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl ${m.is_admin_reply
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none'
                            : 'bg-muted/40 border border-border/50 text-foreground rounded-tl-none'
                            }`}>
                            <p className="text-sm font-medium leading-relaxed">{m.message}</p>
                            <div className={`text-[8px] font-black uppercase tracking-widest mt-2 opacity-40 ${m.is_admin_reply ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                {m.is_admin_reply ? `Admin Response • ${new Date(m.created_at).toLocaleTimeString()}` : `Client Trace • ${new Date(m.created_at).toLocaleTimeString()}`}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative group">
                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Input technical resolution or response..."
                    className="w-full bg-muted/10 border border-border/50 rounded-3xl p-6 pr-20 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium placeholder:opacity-30 min-h-[120px] resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleReply();
                    }}
                ></textarea>
                <button
                    onClick={handleReply}
                    disabled={sending || !reply.trim()}
                    className="absolute bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
            </div>
        </div>
    );
}

