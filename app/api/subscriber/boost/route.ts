import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import pool from '@/lib/db';
import { getRouterService } from '@/lib/mikrotik';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
    user: {
        email: string;
        role: string;
    };
}

interface BoostRequestBody {
    boostType: string;
    durationHours: number;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as SessionUser | null;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: BoostRequestBody = await req.json();
        const { boostType, durationHours } = body;
        const username = session.user.email;

        // 1. Fetch subscriber and their current plan
        const subRes = await pool.query(
            'SELECT s.*, p.name as plan_name FROM subscribers s LEFT JOIN plans p ON s.plan_id = p.id WHERE s.email = $1 OR s.phone = $1',
            [username]
        );

        const sub = subRes.rows[0];
        if (!sub) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });

        // 2. Prevent multiple boosts if one is active
        if (sub.is_boosted && new Date(sub.boost_expiration) > new Date()) {
            return NextResponse.json({ error: 'A boost is already active on your line.' }, { status: 400 });
        }

        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + (durationHours * 60));

        // 3. Determine the Turbo Profile name (Convention: PlanName-Turbo)
        // Ensure this profile exists on the MikroTik router
        const boostProfile = `${sub.plan_name}-Turbo`;

        if (!sub.router_id) throw new Error('No router assigned to your account.');

        const router = await getRouterService(sub.router_id);
        if (!router) throw new Error('Gateway node is currently offline. Boost failed.');

        // 4. Apply Boost on MikroTik
        // In this implementation, we switch the PPP secret profile and kick the session
        await router.activateUser(sub.mikrotik_username || sub.email, boostProfile);

        // 5. Update Database State
        await pool.query(
            `UPDATE subscribers SET is_boosted = TRUE, boost_expiration = $1 WHERE id = $2`,
            [expiration, sub.id]
        );

        // 6. Log the transaction for records
        await pool.query(
            `INSERT INTO boost_logs (subscriber_id, original_plan_name, boost_type, end_time) 
            VALUES ($1, $2, $3, $4)`,
            [sub.id, sub.plan_name, boostType, expiration]
        );

        return NextResponse.json({
            success: true,
            expiration: expiration.toISOString(),
            message: `${boostType.toUpperCase()} Mode Activated! Connection refreshed and bandwidth boosted.`
        });

    } catch (error) {
        console.error('Manual Boost Failure:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET() {
    // Return available boost options
    return NextResponse.json([
        { id: 'turbo', name: 'Turbo Hour', speed: '3x Speed', duration: 1, price: 50, icon: 'Zap' },
        { id: 'gaming', name: 'Gaming Mode', speed: 'Low Latency', duration: 4, price: 100, icon: 'Gamepad2' },
        { id: 'nitro', name: 'Nitro Night', speed: 'Max Performance', duration: 8, price: 150, icon: 'Flame' }
    ]);
}
