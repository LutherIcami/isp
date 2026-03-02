import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BroadcastBody {
    subject: string;
    message: string;
    category?: string;
    type?: 'email' | 'sms' | 'both';
}

interface Recipient {
    id: number;
    email: string | null;
    phone: string | null;
    full_name: string | null;
}

export async function POST(request: Request) {
    try {
        const body: BroadcastBody = await request.json();
        const { subject, message, category, type } = body;

        // 1. Get Recipients (All active subscribers for now)
        const recipientsRes = await pool.query<Recipient>(`SELECT id, email, phone, full_name FROM subscribers WHERE status = 'active'`);
        const recipients = recipientsRes.rows;

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No active recipients found' }, { status: 400 });
        }

        // 2. Log the Broadcast Manifest
        const broadcastResult = await pool.query(
            `INSERT INTO broadcasts (subject, message, category, type, recipients_count)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [subject, message, category || 'general', type || 'email', recipients.length]
        );
        const broadcastId = broadcastResult.rows[0].id;

        // 3. Dispatch Messages (Email implementation via Resend)
        // Note: For SMS, a similar integration would go here.
        const sendPromises = recipients.map(async (sub) => {
            let status = 'sent';
            let errorMsg = null;

            if (type === 'email' || type === 'both') {
                if (sub.email) {
                    try {
                        await resend.emails.send({
                            from: 'AirLink OS <notifications@airlink.com>',
                            to: sub.email,
                            subject: subject,
                            html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                                     <h1 style="color: #6366f1;">${subject}</h1>
                                     <p>Dear ${sub.full_name},</p>
                                     <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border-left: 4px solid #6366f1;">
                                        ${message}
                                     </div>
                                     <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                                        This is an automated system notification from AirLink OS.
                                     </p>
                                   </div>`
                        });
                    } catch (err) {
                        status = 'failed';
                        errorMsg = (err as Error).message;
                    }
                }
            }

            // Log individual delivery manifest node
            await pool.query(
                `INSERT INTO broadcast_logs (broadcast_id, subscriber_id, status, error_message)
                 VALUES ($1, $2, $3, $4)`,
                [broadcastId, sub.id, status, errorMsg]
            );
        });

        // Fire and forget or wait? For UX, we wait for batch initialization.
        await Promise.all(sendPromises);

        // Update Audit Log
        await pool.query(
            `INSERT INTO activity_logs (event_type, description, status)
             VALUES ($1, $2, $3)`,
            ['broadcast', `Strategic Communication Dispatch: "${subject}" to ${recipients.length} nodes.`, 'success']
        );

        return NextResponse.json({ success: true, broadcastId });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT b.*, a.full_name as admin_name
            FROM broadcasts b
            LEFT JOIN admins a ON b.sent_by = a.id
            ORDER BY b.created_at DESC
        `);
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
