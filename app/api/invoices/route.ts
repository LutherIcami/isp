import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const subscriberId = searchParams.get('subscriberId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortField = searchParams.get('sortField') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'DESC';
        const offset = (page - 1) * limit;

        const validFields = ['amount', 'due_date', 'status', 'created_at', 'subscriber_name'];
        const actualSortField = validFields.includes(sortField) ? sortField : 'created_at';
        const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const whereClauses: string[] = [];
        const params: (string | number)[] = [];

        if (subscriberId) {
            params.push(subscriberId);
            whereClauses.push(`i.subscriber_id = $${params.length}`);
        }

        if (status) {
            params.push(status);
            whereClauses.push(`i.status = $${params.length}`);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT i.*, s.full_name as subscriber_name 
            FROM invoices i 
            JOIN subscribers s ON i.subscriber_id = s.id
            ${whereString}
            ORDER BY ${actualSortField} ${actualSortOrder}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) FROM invoices i 
            JOIN subscribers s ON i.subscriber_id = s.id
            ${whereString}
        `;

        const [res, countRes] = await Promise.all([
            pool.query(query, [...params, limit, offset]),
            pool.query(countQuery, params)
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
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
