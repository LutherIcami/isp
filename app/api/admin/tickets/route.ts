import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        let query = `
            SELECT t.*, s.full_name as subscriber_name, s.phone as subscriber_phone
            FROM tickets t
            JOIN subscribers s ON t.subscriber_id = s.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push(`t.status = $${params.length + 1}`);
            params.push(status);
        }
        if (priority) {
            conditions.push(`t.priority = $${params.length + 1}`);
            params.push(priority);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await pool.query(query, params);
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

interface TicketCreateBody {
    subscriber_id: number;
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
}

export async function POST(request: Request) {
    try {
        const body: TicketCreateBody = await request.json();
        const { subscriber_id, subject, description, priority, category } = body;

        const result = await pool.query(
            `INSERT INTO tickets (subscriber_id, subject, description, priority, category, status)
             VALUES ($1, $2, $3, $4, $5, 'open')
             RETURNING *`,
            [subscriber_id, subject, description, priority || 'medium', category || 'technical']
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
