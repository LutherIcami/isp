import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { MikroTikService } from '@/lib/mikrotik';

import { cache } from '@/lib/cache';

interface RouterRow {
    id: number;
    name: string;
    ip_address: string;
    username: string;
    password?: string | null;
    api_port?: number | null;
}

export async function GET() {
    try {
        // 0. Check Cache First
        const cachedHealth = cache.get('router_health_all');
        if (cachedHealth) {
            return NextResponse.json(cachedHealth);
        }

        // 1. Get all routers
        const routersRes = await pool.query<RouterRow>('SELECT * FROM routers');
        const routers = routersRes.rows;

        // 2. Poll health for each router in parallel
        const healthStats = await Promise.all(routers.map(async (router) => {
            const service = new MikroTikService({
                host: router.ip_address,
                user: router.username,
                pass: router.password || '',
                port: router.api_port || 8728
            });

            const health = await service.getHealth();
            return {
                id: router.id,
                name: router.name,
                ip: router.ip_address,
                ...health
            };
        }));

        // 3. Save to Cache (30 seconds TTL)
        cache.set('router_health_all', healthStats, 30);

        return NextResponse.json(healthStats);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
