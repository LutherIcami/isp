import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // 1. Get monthly revenue for the last 6 months
        const revenueRes = await pool.query(`
            SELECT 
                TO_CHAR(payment_date, 'Mon YYYY') as month,
                SUM(amount) as total,
                DATE_TRUNC('month', payment_date) as month_start
            FROM payments
            WHERE payment_date > CURRENT_DATE - INTERVAL '6 months'
            GROUP BY month, month_start
            ORDER BY month_start ASC
        `);

        // 2. Get Revenue Projections (Active subscribers * their plan prices)
        const projectionRes = await pool.query(`
            SELECT SUM(p.price) as projected
            FROM subscribers s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status = 'active'
        `);

        // 3. Collection Efficiency (Paid vs Unpaid ratio for current month)
        const collectionRes = await pool.query(`
            SELECT 
                status,
                SUM(amount) as total
            FROM invoices
            WHERE billing_period_start >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY status
        `);

        // 4. Growth Stats (Subscribers joined per month)
        const growthRes = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as new_subs,
                DATE_TRUNC('month', created_at) as month_start
            FROM subscribers
            WHERE created_at > CURRENT_DATE - INTERVAL '6 months'
            GROUP BY month, month_start
            ORDER BY month_start ASC
        `);

        // 5. Plan Distribution
        const planDistributionRes = await pool.query(`
            SELECT 
                p.name,
                COUNT(s.id) as subscriber_count
            FROM plans p
            LEFT JOIN subscribers s ON p.id = s.plan_id
            GROUP BY p.name
        `);

        return NextResponse.json({
            revenueHistory: revenueRes.rows,
            projection: projectionRes.rows[0]?.projected || 0,
            collectionStats: collectionRes.rows,
            growthStats: growthRes.rows,
            planDistribution: planDistributionRes.rows
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
