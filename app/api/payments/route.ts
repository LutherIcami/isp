import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { NotificationService } from '@/lib/notifications';

export async function GET() {
    try {
        const res = await pool.query(`
            SELECT p.*, s.full_name as subscriber_name 
            FROM payments p 
            LEFT JOIN subscribers s ON p.subscriber_id = s.id 
            ORDER BY p.payment_date DESC
        `);
        return NextResponse.json(res.rows);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

interface PaymentCreateBody {
    subscriber_id: number;
    invoice_id?: number;
    amount: number | string;
    payment_method: string;
    transaction_id: string;
}

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        const body: PaymentCreateBody = await request.json();
        const { subscriber_id, invoice_id, amount, payment_method, transaction_id } = body;

        await client.query('BEGIN');

        // 0. Get subscriber info for notification
        const subRes = await client.query('SELECT phone, full_name FROM subscribers WHERE id = $1', [subscriber_id]);
        const subscriber = subRes.rows[0];

        // 1. Insert Payment
        const res = await client.query(
            `INSERT INTO payments (subscriber_id, invoice_id, amount, payment_method, transaction_id, status) 
             VALUES ($1, $2, $3, $4, $5, 'success') RETURNING *`,
            [subscriber_id, invoice_id, amount, payment_method, transaction_id]
        );

        // 2. Update invoice status
        if (invoice_id) {
            await client.query("UPDATE invoices SET status = 'paid' WHERE id = $1", [invoice_id]);
        }

        // 3. Log activity
        await client.query(
            `INSERT INTO activity_logs (subscriber_id, action, details) VALUES ($1, $2, $3)`,
            [subscriber_id, 'Manual Payment', `Logged manual payment of KES ${amount} via ${payment_method}. Transaction ID: ${transaction_id}`]
        );

        await client.query('COMMIT');

        // Send Notification (non-blocking)
        if (subscriber && subscriber.phone) {
            NotificationService.sendPaymentReceipt(
                subscriber.phone,
                subscriber.full_name,
                parseFloat(amount.toString()),
                transaction_id
            ).catch((err: Error) => console.error('Notification failed:', err.message));
        }

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        client.release();
    }
}
