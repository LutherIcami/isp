import { NextResponse } from 'next/server';
import pool from '@/lib/db';

import { cache } from '@/lib/cache';

export async function GET() {
    try {
        // 0. Check Cache (5 minutes TTL for financial reports)
        const cachedReports = cache.get('revenue_report_stats');
        if (cachedReports) {
            return NextResponse.json(cachedReports);
        }

        // 1. Monthly Recurring Revenue (MRR) Trends - Last 6 months
        const mrrQuery = `
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                SUM(amount) as revenue,
                COUNT(*) as invoice_count
            FROM invoices
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `;

        // 2. Subscriber Growth Trends
        const growthQuery = `
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as new_subscribers
            FROM subscribers
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `;

        // 3. Collection Efficiency (Current Month)
        const efficiencyQuery = `
            SELECT 
                status,
                SUM(amount) as total_amount
            FROM invoices
            WHERE created_at >= DATE_TRUNC('month', NOW())
            GROUP BY status
        `;

        const [mrrRes, growthRes, efficiencyRes] = await Promise.all([
            pool.query(mrrQuery),
            pool.query(growthQuery),
            pool.query(efficiencyQuery)
        ]);

        const stats = {
            mrr: mrrRes.rows,
            growth: growthRes.rows,
            efficiency: efficiencyRes.rows
        };

        // 3. Save to Cache (5 minutes)
        cache.set('revenue_report_stats', stats, 300);

        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
