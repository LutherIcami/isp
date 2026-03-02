'use client';

import React, { useState } from 'react';
import { X, Server, Globe, User, Lock, Hash, Loader2, CheckCircle2, AlertTriangle, Wifi } from 'lucide-react';

interface AddRouterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddRouterModal = ({ isOpen, onClose, onSuccess }: AddRouterModalProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        username: '',
        password: '',
        api_port: '8728'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const res = await fetch('/api/routers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setSuccess(false);
                    setFormData({
                        name: '',
                        ip_address: '',
                        username: '',
                        password: '',
                        api_port: '8728'
                    });
                }, 2000);
            } else {
                setError(result.error || 'Failed to connect to router. Please check credentials and IP reachability.');
            }
        } catch (err) {
            setError('System error: Unable to reach the router API.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/20">
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Connect New Node</h2>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Provision a new MikroTik RouterOS instance.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-muted bg-muted/20 rounded-2xl transition-all border border-border/50">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {success ? (
                        <div className="py-12 text-center animate-in zoom-in duration-500 flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mb-6">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                            <h3 className="text-3xl font-black text-foreground mb-2 tracking-tighter uppercase italic">Node <span className="text-green-500">Synchronized</span></h3>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Router is online and responding to API requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Friendly Name</label>
                                    <div className="relative">
                                        <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Base Station A"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-foreground placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">IP Address</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="192.168.88.1"
                                            value={formData.ip_address}
                                            onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono font-bold text-foreground placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">API Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="admin"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-foreground placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">API Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono font-bold text-foreground placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">API Port</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        required
                                        type="number"
                                        placeholder="8728"
                                        value={formData.api_port}
                                        onChange={(e) => setFormData({ ...formData, api_port: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono font-bold text-foreground placeholder:text-muted-foreground/30"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 text-xs rounded-2xl flex items-start gap-3">
                                    <AlertTriangle size={18} className="shrink-0" />
                                    <span className="font-bold leading-relaxed">{error}</span>
                                </div>
                            )}

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-5 bg-muted/50 text-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] border border-border/50 hover:bg-muted transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-primary text-primary-foreground px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Establishing Link...
                                        </>
                                    ) : (
                                        <>
                                            <Wifi size={16} />
                                            Connect Router
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
