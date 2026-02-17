import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { MikroTikService } from '@/lib/mikrotik';

import { cache } from '@/lib/cache';

export async function GET() {
    try {
        // 0. Check Cache First
        const cachedHealth = cache.get('router_health_all');
        if (cachedHealth) {
            return NextResponse.json(cachedHealth);
        }

        // 1. Get all routers
        const routersRes = await pool.query('SELECT * FROM routers');
        const routers = routersRes.rows;

        // 2. Poll health for each router in parallel
        const healthStats = await Promise.all(routers.map(async (router) => {
            const service = new MikroTikService({
                host: router.ip_address,
                user: router.username,
                pass: router.password,
                port: router.api_port
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
