import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const query = `
            SELECT l.*, s.full_name as subscriber_name 
            FROM activity_logs l
            LEFT JOIN subscribers s ON l.subscriber_id = s.id
            ORDER BY l.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const countQuery = 'SELECT COUNT(*) FROM activity_logs';

        const [res, countRes] = await Promise.all([
            pool.query(query, [limit, offset]),
            pool.query(countQuery)
        ]);

        return NextResponse.json({
            data: res.rows,
            pagination: {
                total: parseInt(countRes.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
