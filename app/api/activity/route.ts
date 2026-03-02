import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const res = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20');
        return NextResponse.json(res.rows);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { event_type, description, status }: { event_type: string; description: string; status?: string } = await request.json();

        const res = await pool.query(
            'INSERT INTO activity_logs (event_type, description, status) VALUES ($1, $2, $3) RETURNING *',
            [event_type, description, status || 'success']
        );

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
