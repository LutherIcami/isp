import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400',
        yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    );
};
