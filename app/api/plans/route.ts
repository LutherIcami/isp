import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const res = await pool.query('SELECT * FROM plans ORDER BY price ASC');
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, download_speed, upload_speed, price, billing_cycle, data_limit_gb } = body;

        const res = await pool.query(
            `INSERT INTO plans (name, download_speed, upload_speed, price, billing_cycle, data_limit_gb) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, download_speed, upload_speed, price, billing_cycle, data_limit_gb]
        );

        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
