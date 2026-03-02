import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const stats = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN status = 'paid' AND created_at >= date_trunc('month', now()) THEN amount ELSE 0 END), 0) as monthly_revenue,
                COALESCE(SUM(CASE WHEN status = 'unpaid' OR status = 'overdue' THEN amount ELSE 0 END), 0) as pending_collections,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
                COUNT(CASE WHEN status = 'paid' AND created_at >= date_trunc('month', now()) THEN 1 END) as paid_today
            FROM invoices
        `);

        // Get collection rate (paid vs total generated this month)
        const collectionRate = await pool.query(`
            SELECT 
                (COUNT(CASE WHEN status = 'paid' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
            FROM invoices
            WHERE created_at >= date_trunc('month', now())
        `);

        return NextResponse.json({
            ...stats.rows[0],
            collection_rate: parseFloat(collectionRate.rows[0]?.rate || '0').toFixed(1)
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
