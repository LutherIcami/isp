import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorVariants = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    return (
        <div className="glass-card group p-6 hover:-translate-y-1.5 transition-all duration-500 cursor-default overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all group-hover:scale-150 ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : color === 'purple' ? 'bg-purple-500' : color === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-3.5 rounded-2xl border ${colorVariants[color]} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${trend.isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] mb-1 opacity-70 group-hover:opacity-100 transition-opacity">{title}</h3>
                <p className="text-3xl font-black text-foreground tracking-tighter animate-reveal group-hover:gradient-text">
                    {value}
                </p>
            </div>
        </div>
    );
};
