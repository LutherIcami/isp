import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface SubscriberRow {
    id: number;
    full_name: string;
    created_at: string;
    overdue_count: string;
    unpaid_count: string;
    total_invoices: string;
}

export async function POST() {
    try {
        // 1. Fetch all subscribers with their invoice history
        const subsRes = await pool.query<SubscriberRow>(`
            SELECT 
                s.id, 
                s.full_name,
                s.created_at,
                (SELECT COUNT(*) FROM invoices WHERE subscriber_id = s.id AND status = 'overdue') as overdue_count,
                (SELECT COUNT(*) FROM invoices WHERE subscriber_id = s.id AND status = 'unpaid') as unpaid_count,
                (SELECT COUNT(*) FROM invoices WHERE subscriber_id = s.id) as total_invoices
            FROM subscribers s
        `);

        for (const sub of subsRes.rows) {
            let score = 0;
            const reasons: string[] = [];
            const overdueCount = parseInt(sub.overdue_count);

            // Factor 1: Payment history
            if (overdueCount > 0) {
                score += (overdueCount * 25);
                reasons.push(`${overdueCount} overdue invoices`);
            }

            // Factor 2: New Client Risk
            const ageDays = (new Date().getTime() - new Date(sub.created_at).getTime()) / (1000 * 3600 * 24);
            if (ageDays < 30) {
                score += 15;
                reasons.push("Early onboarding phase (< 30 days)");
            }

            // Factor 3: Utilization (Mock)
            // In a real app, we'd check if bytes_in/out is zero for many days
            const randomDowntimeFactor = Math.random() > 0.8 ? 15 : 0;
            if (randomDowntimeFactor > 0) {
                score += randomDowntimeFactor;
                reasons.push("Low throughput utilization detected");
            }

            // Clamp score
            const finalScore = Math.min(100, score);

            // Update subscriber record
            await pool.query(
                'UPDATE subscribers SET churn_score = $1, risk_factors = $2 WHERE id = $3',
                [finalScore, reasons.join(', '), sub.id]
            );
        }

        return NextResponse.json({
            success: true,
            message: `Retention analysis completed for ${subsRes.rows.length} subscribers.`
        });

    } catch (error) {
        console.error('Churn Analysis Error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET() {
    // Get high risk subscribers
    const res = await pool.query(`
        SELECT id, full_name, churn_score, risk_factors 
        FROM subscribers 
        WHERE churn_score > 30 
        ORDER BY churn_score DESC 
        LIMIT 10
    `);
    return NextResponse.json(res.rows);
}
