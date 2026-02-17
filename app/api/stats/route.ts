import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const subscribersCount = await pool.query("SELECT COUNT(*) FROM subscribers");
        const activeSubscribers = await pool.query("SELECT COUNT(*) FROM subscribers WHERE status = 'active'");
        const revenue = await pool.query("SELECT SUM(amount) as total FROM payments WHERE payment_date >= date_trunc('month', current_date)");
        const overdueInvoices = await pool.query("SELECT COUNT(*) FROM invoices WHERE status = 'unpaid' AND due_date < current_date");

        // Daily revenue for the last 7 days
        const dailyRevenue = await pool.query(`
            SELECT 
                to_char(date_trunc('day', payment_date), 'Dy') as day,
                SUM(amount) as total
            FROM payments 
            WHERE payment_date >= current_date - interval '6 days'
            GROUP BY date_trunc('day', payment_date)
            ORDER BY date_trunc('day', payment_date)
        `);

        // Connection types breakdown
        const connectionBreakdown = await pool.query(`
            SELECT connection_type as type, COUNT(*) as count 
            FROM subscribers 
            GROUP BY connection_type
        `);

        return NextResponse.json({
            totalSubscribers: parseInt(subscribersCount.rows[0].count),
            activeSubscribers: parseInt(activeSubscribers.rows[0].count),
            monthlyRevenue: parseFloat(revenue.rows[0].total || 0),
            overdueCount: parseInt(overdueInvoices.rows[0].count),
            dailyRevenue: dailyRevenue.rows,
            connectionBreakdown: connectionBreakdown.rows
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
