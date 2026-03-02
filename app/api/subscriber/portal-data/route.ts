import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = session.user.email;

        // Fetch subscriber data
        const subRes = await pool.query(`
            SELECT 
                s.*, 
                p.name as plan_name, 
                p.download_speed, 
                p.price as plan_price
            FROM subscribers s
            LEFT JOIN plans p ON s.plan_id = p.id
            WHERE s.email = $1 OR s.phone = $1
        `, [email]);

        if (subRes.rows.length === 0) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        const subscriber = subRes.rows[0];

        // Fetch recent invoices
        const invRes = await pool.query(`
            SELECT * FROM invoices 
            WHERE subscriber_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [subscriber.id]);

        return NextResponse.json({
            subscriber: {
                id: subscriber.id,
                fullName: subscriber.full_name,
                email: subscriber.email,
                phone: subscriber.phone,
                status: subscriber.status,
                plan: subscriber.plan_name || 'No Plan Selected',
                speed: subscriber.download_speed || '0',
                price: subscriber.plan_price || 0,
                nextBilling: subscriber.next_billing_date,
            },
            invoices: invRes.rows
        });

    } catch (error) {
        console.error('Portal data error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
