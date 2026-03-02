import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { MikroTikService } from '@/lib/mikrotik';

export async function GET() {
    try {
        const res = await pool.query('SELECT id, name, ip_address, api_port, status FROM routers');

        // Proactively check health or get stats if needed
        // For now just return the list
        return NextResponse.json(res.rows);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: {
            name: string;
            ip_address: string;
            username: string;
            password?: string;
            api_port?: string;
        } = await request.json();
        const { name, ip_address, username, password, api_port } = body;

        // Verify connection before saving
        const mkService = new MikroTikService({
            host: ip_address,
            user: username,
            pass: password || '',
            port: parseInt(api_port || '8728') || 8728
        });

        const health = await mkService.getHealth();
        if (health.status === 'offline') {
            return NextResponse.json(
                { error: 'Could not establish connection to the router. Check the IP address, credentials, and ensure the API service (port 8728) is enabled on the MikroTik.' },
                { status: 400 }
            );
        }

        const res = await pool.query(
            `INSERT INTO routers (name, ip_address, username, password, api_port, status) 
             VALUES ($1, $2, $3, $4, $5, 'online') RETURNING id, name, ip_address`,
            [name, ip_address, username, password, parseInt(api_port || '8728') || 8728]
        );

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
