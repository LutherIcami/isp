'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    Shield, Lock, Plus, Trash2, Power,
    RefreshCw, Cpu,
    Server, ChevronRight, X
} from 'lucide-react';

interface FirewallRule {
    '.id': string;
    chain: string;
    action: string;
    protocol?: string;
    'src-address'?: string;
    'dst-address'?: string;
    'dst-port'?: string;
    comment?: string;
    disabled: string;
}

interface Router {
    id: number;
    name: string;
    status: string;
}

export default function FirewallPage() {
    const [routers, setRouters] = useState<Router[]>([]);
    const [selectedRouterId, setSelectedRouterId] = useState<number | null>(null);
    const [rules, setRules] = useState<FirewallRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [newRule, setNewRule] = useState({
        chain: 'forward',
        action: 'drop',
        protocol: 'tcp',
        src_address: '',
        dst_address: '',
        dst_port: '',
        comment: ''
    });

    const fetchRouters = useCallback(async () => {
        try {
            const res = await fetch('/api/routers');
            const data = await res.json();
            setRouters(data);
            if (data.length > 0 && selectedRouterId === null) {
                setSelectedRouterId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch routers:', error);
        }
    }, [selectedRouterId]);

    const fetchRules = useCallback(async () => {
        if (!selectedRouterId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/routers/${selectedRouterId}/firewall`);
            const data = await res.json();
            setRules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch firewall rules:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedRouterId]);

    useEffect(() => {
        fetchRouters();
    }, [fetchRouters]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleToggle = async (ruleId: string, currentDisabled: boolean) => {
        try {
            setRules(prev => prev.map(r => r['.id'] === ruleId ? { ...r, disabled: (!currentDisabled).toString() } : r));
            await fetch(`/api/admin/routers/${selectedRouterId}/firewall`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mikrotikId: ruleId, disabled: !currentDisabled })
            });
        } catch {
            fetchRules();
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!confirm('Are you sure you want to decommission this rule node?')) return;
        try {
            await fetch(`/api/admin/routers/${selectedRouterId}/firewall?mikrotikId=${encodeURIComponent(ruleId)}`, {
                method: 'DELETE'
            });
            fetchRules();
        } catch (error) {
            console.error('Failed to delete rule:', error);
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSyncing(true);
            await fetch(`/api/admin/routers/${selectedRouterId}/firewall`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRule)
            });
            setShowAddModal(false);
            fetchRules();
        } catch (error) {
            alert('Failed to provision rule.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto relative animate-reveal">
                <header className="mb-12 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Active Security Manifest</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Network <span className="gradient-text">Firewall</span></h1>
                        <p className="text-muted-foreground font-medium text-sm">
                            Granular traffic orchestration and edge security policy management.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={selectedRouterId || ''}
                            onChange={(e) => setSelectedRouterId(Number(e.target.value))}
                            className="bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            {routers.map(r => (
                                <option key={r.id} value={r.id} className="bg-background">{r.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-sm font-black hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Plus size={20} /> Provision Rule
                        </button>
                    </div>
                </header>

                <div className="glass-card border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden relative min-h-[600px]">
                    <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Access Control Manifest</h3>
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{rules.length} Active Nodes</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchRules}
                            className="p-3 hover:bg-muted/50 rounded-xl transition-all text-muted-foreground hover:text-primary"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] px-10">
                                <tr>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6">Chain & Action</th>
                                    <th className="px-10 py-6">Manifest Policy</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading && rules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-32 text-center text-muted-foreground font-black uppercase tracking-widest text-sm opacity-20">Syncing Firewall Manifest...</td>
                                    </tr>
                                ) : rules.map((rule) => (
                                    <tr key={rule['.id']} className={`hover:bg-primary/5 transition-all group ${rule.disabled === 'true' ? 'opacity-40 grayscale' : ''}`}>
                                        <td className="px-10 py-6">
                                            <button
                                                onClick={() => handleToggle(rule['.id'], rule.disabled === 'true')}
                                                className={`p-2 rounded-lg transition-all ${rule.disabled === 'true' ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-500'}`}
                                            >
                                                <Power size={14} />
                                            </button>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-muted/40 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border/50">{rule.chain}</span>
                                                <ChevronRight size={12} className="text-muted-foreground/30" />
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${rule.action === 'accept' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    rule.action === 'drop' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>{rule.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 max-w-md">
                                            <p className="font-black text-foreground uppercase truncate">
                                                {rule.comment || 'Unnamed Strategic Node'}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                                                {rule.protocol && <span className="flex items-center gap-1"><Cpu size={10} /> {rule.protocol}</span>}
                                                {rule['src-address'] && <span className="flex items-center gap-1"><Server size={10} /> {rule['src-address']}</span>}
                                                {rule['dst-port'] && <span className="flex items-center gap-1"><Lock size={10} /> port {rule['dst-port']}</span>}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button
                                                onClick={() => handleDelete(rule['.id'])}
                                                className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Provision Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" onClick={() => setShowAddModal(false)}></div>
                        <div className="glass-card w-full max-w-2xl p-10 rounded-[3rem] relative z-10 shadow-2xl animate-reveal">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Provision Security Rule</h2>
                                    <p className="text-muted-foreground font-medium text-xs mt-1 uppercase tracking-widest opacity-50">Strategic Edge Orchestration</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Logic Chain</label>
                                        <select
                                            value={newRule.chain}
                                            onChange={(e) => setNewRule({ ...newRule, chain: e.target.value })}
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="input">Input</option>
                                            <option value="forward">Forward</option>
                                            <option value="output">Output</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Enforcement Action</label>
                                        <select
                                            value={newRule.action}
                                            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-red-500"
                                        >
                                            <option value="accept">Accept</option>
                                            <option value="drop">Drop (Reject Packet)</option>
                                            <option value="reject">Reject (ICMP)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Protocol Manifest</label>
                                        <input
                                            type="text"
                                            value={newRule.protocol}
                                            onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                                            placeholder="e.g. tcp, udp, icmp"
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Descriptor (Comment)</label>
                                        <input
                                            type="text"
                                            value={newRule.comment}
                                            onChange={(e) => setNewRule({ ...newRule, comment: e.target.value })}
                                            placeholder="Rule trace identifier"
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Target IP / Format</label>
                                        <input
                                            type="text"
                                            value={newRule.src_address}
                                            onChange={(e) => setNewRule({ ...newRule, src_address: e.target.value })}
                                            placeholder="0.0.0.0/0"
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Target Port Manifest</label>
                                        <input
                                            type="text"
                                            value={newRule.dst_port}
                                            onChange={(e) => setNewRule({ ...newRule, dst_port: e.target.value })}
                                            placeholder="e.g. 80, 443"
                                            className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 pt-6">
                                    <button
                                        type="submit"
                                        disabled={syncing}
                                        className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                        {syncing ? <RefreshCw className="animate-spin" size={20} /> : <><Shield size={20} /> Commit to Edge Manifest</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
