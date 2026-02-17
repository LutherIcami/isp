import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsString = searchParams.get('ids');

        if (!idsString) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        const ids = idsString.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

        if (ids.length === 0) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        const query = `
            SELECT i.*, s.full_name as subscriber_name, s.email as subscriber_email, s.phone as subscriber_phone,
                   p.name as plan_name, p.download_speed, p.upload_speed
            FROM invoices i 
            JOIN subscribers s ON i.subscriber_id = s.id
            LEFT JOIN plans p ON s.plan_id = p.id
            WHERE i.id = ANY($1)
            ORDER BY i.created_at DESC
        `;

        const res = await pool.query(query, [ids]);

        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
