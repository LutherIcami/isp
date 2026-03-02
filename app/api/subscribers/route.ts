import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getRouterService } from '@/lib/mikrotik';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const sortField = searchParams.get('sortField') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'DESC';
        const offset = (page - 1) * limit;

        // Valid sort fields to prevent SQL injection
        const validFields = ['full_name', 'email', 'phone', 'status', 'created_at', 'plan_name'];
        const actualSortField = validFields.includes(sortField) ? sortField : 'created_at';
        const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let whereConditions = [];
        let params: (string | number)[] = [];

        if (search) {
            whereConditions.push(`(s.full_name ILIKE $${params.length + 1} OR s.phone ILIKE $${params.length + 1} OR s.email ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (status && status !== 'all') {
            whereConditions.push(`s.status = $${params.length + 1}`);
            params.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT s.*, p.name as plan_name, r.name as router_name 
            FROM subscribers s 
            LEFT JOIN plans p ON s.plan_id = p.id 
            LEFT JOIN routers r ON s.router_id = r.id
            ${whereClause}
            ORDER BY ${actualSortField} ${actualSortOrder}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `SELECT COUNT(*) FROM subscribers s ${whereClause}`;

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

interface SubscriberCreateBody {
    full_name: string;
    phone: string;
    email: string;
    plan_id: number;
    router_id?: number | null;
    mikrotik_username?: string;
    mikrotik_password?: string;
}

export async function POST(request: Request) {
    try {
        const body: SubscriberCreateBody = await request.json();
        const { full_name, phone, email, plan_id, router_id, mikrotik_username, mikrotik_password } = body;

        // 1. Save to Database
        const res = await pool.query(
            `INSERT INTO subscribers (full_name, phone, email, plan_id, router_id, mikrotik_username, mikrotik_password, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING id`,
            [full_name, phone, email, plan_id, router_id, mikrotik_username, mikrotik_password]
        );

        const newId = res.rows[0].id;

        // 2. Provision on MikroTik
        if (router_id) {
            const routerService = await getRouterService(router_id);
            if (routerService) {
                const planRes = await pool.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
                if (planRes.rows.length > 0) {
                    const plan = planRes.rows[0];
                    const profileName = `${plan.download_speed}/${plan.upload_speed}`;
                    await routerService.upsertUser(
                        mikrotik_username || '',
                        mikrotik_password || '',
                        profileName,
                        full_name
                    );
                }
            }
        }

        // 3. Log activity
        await pool.query(
            `INSERT INTO activity_logs (subscriber_id, action, details) VALUES ($1, $2, $3)`,
            [newId, 'New Installation', `Registered new subscriber: ${full_name} on router node ID: ${router_id}`]
        );

        return NextResponse.json({ success: true, id: newId });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
