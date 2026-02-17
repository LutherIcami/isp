import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { NotificationService } from '@/lib/notifications';

export async function POST() {
    try {
        // Find invoices due in the next 2 days that are unpaid
        const query = `
            SELECT i.*, s.full_name, s.phone 
            FROM invoices i
            JOIN subscribers s ON i.subscriber_id = s.id
            WHERE i.status = 'unpaid' 
            AND i.due_date <= NOW() + INTERVAL '2 days'
            AND i.due_date > NOW()
        `;

        const res = await pool.query(query);
        const soonDue = res.rows;

        let sentCount = 0;
        for (const inv of soonDue) {
            if (inv.phone) {
                await NotificationService.sendBillingReminder(
                    inv.phone,
                    inv.full_name,
                    parseFloat(inv.amount),
                    new Date(inv.due_date).toLocaleDateString()
                );
                sentCount++;
            }
        }

        // Log this batch action
        await pool.query(
            "INSERT INTO activity_logs (action, details) VALUES ($1, $2)",
            ['Batch Reminder', `Sent automated billing reminders to ${sentCount} subscribers with upcoming deadlines.`]
        );

        return NextResponse.json({ success: true, count: sentCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
