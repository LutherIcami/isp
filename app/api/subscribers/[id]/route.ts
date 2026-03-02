import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getRouterService } from '@/lib/mikrotik';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const query = `
            SELECT s.*, p.name as plan_name, p.download_speed, p.upload_speed, p.price as plan_price, r.name as router_name 
            FROM subscribers s 
            LEFT JOIN plans p ON s.plan_id = p.id 
            LEFT JOIN routers r ON s.router_id = r.id
            WHERE s.id = $1
        `;
        const res = await pool.query(query, [id]);

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        // Fetch recent activity
        const activityQuery = `
            SELECT * FROM activity_logs 
            WHERE subscriber_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        const activityRes = await pool.query(activityQuery, [id]);

        // Fetch recent invoices
        const invoicesQuery = `
            SELECT * FROM invoices 
            WHERE subscriber_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        `;
        const invoicesRes = await pool.query(invoicesQuery, [id]);

        return NextResponse.json({
            subscriber: res.rows[0],
            activity: activityRes.rows,
            invoices: invoicesRes.rows
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { status, plan_id, router_id, address } = body;

        // Fetch current state for MikroTik update
        const currentRes = await pool.query('SELECT * FROM subscribers WHERE id = $1', [id]);
        if (currentRes.rows.length === 0) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }
        const subscriber = currentRes.rows[0];

        // 1. Update Database
        const fields = [];
        const values = [];
        let idx = 1;

        if (status) {
            fields.push(`status = $${idx++}`);
            values.push(status);
        }
        if (plan_id) {
            fields.push(`plan_id = $${idx++}`);
            values.push(plan_id);
        }
        if (router_id) {
            fields.push(`router_id = $${idx++}`);
            values.push(router_id);
        }
        if (address) {
            fields.push(`address = $${idx++}`);
            values.push(address);
        }

        if (fields.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const query = `UPDATE subscribers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const updateRes = await pool.query(query, [...values, id]);

        // 2. Sync with MikroTik if status or plan changed
        if (status || plan_id) {
            const routerService = await getRouterService(subscriber.router_id);
            if (routerService) {
                if (status) {
                    // Note: We might need to implement setUserEnabled in mikrotik.ts if it doesn't exist
                    // For now, assuming upsertUser can handle status or we can add a toggle
                    if (status === 'suspended') {
                        // Logic to disable user
                        await routerService.disableUser(subscriber.mikrotik_username);
                    } else if (status === 'active') {
                        // Logic to enable user
                        await routerService.enableUser(subscriber.mikrotik_username);
                    }
                }
            }
        }

        // 3. Log Activity
        if (status) {
            await pool.query(
                `INSERT INTO activity_logs (subscriber_id, action, details) VALUES ($1, $2, $3)`,
                [id, 'Status Update', `Account ${status === 'suspended' ? 'Suspended' : 'Reactivated'} by Administraton`]
            );
        }

        return NextResponse.json({ success: true, data: updateRes.rows[0] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
