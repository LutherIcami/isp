import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as SessionUser | null;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscriberId = session.user.id;

        // 1. Get Subscriber Details & Current Plan
        const subRes = await pool.query(`
            SELECT s.*, p.name as plan_name, p.download_speed, p.upload_speed, r.name as router_name
            FROM subscribers s
            LEFT JOIN plans p ON s.plan_id = p.id
            LEFT JOIN routers r ON s.router_id = r.id
            WHERE s.id = $1
        `, [subscriberId]);

        // 2. Get Recent Invoices
        const invoiceRes = await pool.query(`
            SELECT * FROM invoices 
            WHERE subscriber_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [subscriberId]);

        // 3. Get Active Support Tickets
        const ticketRes = await pool.query(`
            SELECT * FROM tickets 
            WHERE subscriber_id = $1 
            ORDER BY created_at DESC 
            LIMIT 3
        `, [subscriberId]);

        // 4. Update last_login
        await pool.query(`UPDATE subscribers SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [subscriberId]);

        return NextResponse.json({
            profile: subRes.rows[0],
            invoices: invoiceRes.rows,
            tickets: ticketRes.rows
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
