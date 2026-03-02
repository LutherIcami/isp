import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
                (SELECT COUNT(*) FROM activity_logs WHERE action = 'New Installation' AND created_at >= NOW() - INTERVAL '30 days') as new_count
            FROM subscribers
        `;

        const res = await pool.query(statsQuery);
        return NextResponse.json(res.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
