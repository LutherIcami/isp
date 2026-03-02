import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticketId = params.id;

        // Get Ticket details
        const ticketRes = await pool.query(
            `SELECT t.*, s.full_name as subscriber_name, s.phone as subscriber_phone, s.email as subscriber_email
             FROM tickets t
             JOIN subscribers s ON t.subscriber_id = s.id
             WHERE t.id = $1`,
            [ticketId]
        );

        if (ticketRes.rows.length === 0) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Get Conversation history
        const messagesRes = await pool.query(
            `SELECT tm.*, a.full_name as admin_name
             FROM ticket_messages tm
             LEFT JOIN admins a ON tm.is_admin_reply = true AND tm.sender_id = a.id
             WHERE tm.ticket_id = $1
             ORDER BY tm.created_at ASC`,
            [ticketId]
        );

        return NextResponse.json({
            ticket: ticketRes.rows[0],
            messages: messagesRes.rows
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

interface TicketUpdateBody {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assigned_admin_id?: number;
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticketId = params.id;
        const body: TicketUpdateBody = await request.json();
        const { status, priority, assigned_admin_id } = body;

        const updates = [];
        const values = [];

        if (status) {
            updates.push(`status = $${values.length + 1}`);
            values.push(status);
        }
        if (priority) {
            updates.push(`priority = $${values.length + 1}`);
            values.push(priority);
        }
        if (assigned_admin_id) {
            updates.push(`assigned_admin_id = $${values.length + 1}`);
            values.push(assigned_admin_id);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        values.push(ticketId);
        const query = `UPDATE tickets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;

        const result = await pool.query(query, values);
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

interface TicketReplyBody {
    message: string;
    admin_id: number;
}

// Reply to ticket
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticketId = params.id;
        const body: TicketReplyBody = await request.json();
        const { message, admin_id } = body;

        // Insert message
        const messageRes = await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message, is_admin_reply)
             VALUES ($1, $2, $3, true)
             RETURNING *`,
            [ticketId, admin_id, message]
        );

        // Update ticket's updated_at and potentially status to 'in-progress'
        await pool.query(
            `UPDATE tickets SET status = 'in-progress', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [ticketId]
        );

        return NextResponse.json(messageRes.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
