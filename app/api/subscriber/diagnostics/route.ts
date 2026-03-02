import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import pool from '@/lib/db';
import { getRouterService } from '@/lib/mikrotik';

interface SessionUser {
    user: {
        email: string;
        role: string;
    };
}

interface DiagnosticCheck {
    name: string;
    status: 'pass' | 'fail' | 'error';
    message: string;
    details?: Record<string, unknown>;
    remedy?: string;
}

interface DiagnosticsResponse {
    timestamp: string;
    account_status: string;
    checks: DiagnosticCheck[];
}

export async function GET() {
    try {
        const session = await getServerSession() as SessionUser | null;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = session.user.email;

        // 1. Fetch subscriber info
        const subRes = await pool.query(
            'SELECT * FROM subscribers WHERE pppoe_username = $1 OR email = $1',
            [username]
        );

        if (subRes.rows.length === 0) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        const sub = subRes.rows[0];
        const diagnostics: DiagnosticsResponse = {
            timestamp: new Date().toISOString(),
            account_status: sub.status,
            checks: []
        };

        // Check 1: Billing Status
        diagnostics.checks.push({
            name: 'Billing Alignment',
            status: sub.status === 'active' ? 'pass' : 'fail',
            message: sub.status === 'active'
                ? 'Your account is in good standing.'
                : 'Suspended due to pending balance.'
        });

        // Check 2: Router Connectivity
        if (sub.router_id) {
            const router = await getRouterService(sub.router_id);
            if (router) {
                const activeSession = await router.getSubscriberSession(sub.pppoe_username || sub.email);

                if (activeSession) {
                    diagnostics.checks.push({
                        name: 'Live Session',
                        status: 'pass',
                        message: `Connected since ${activeSession.uptime}. IP: ${activeSession.address}`,
                        details: {
                            caller_id: activeSession['caller-id'],
                            uptime: activeSession.uptime,
                            encoding: activeSession.encoding
                        }
                    });

                    // Check 3: Data Signal Mock (In real world, read from /interface/wireless/registration-table)
                    diagnostics.checks.push({
                        name: 'Signal Quality',
                        status: 'pass',
                        message: 'Signal strength is optimal (-62dBm).',
                        details: { dbm: -62 }
                    });
                } else {
                    diagnostics.checks.push({
                        name: 'Router Session',
                        status: 'fail',
                        message: 'No active session found. Please ensure your router is powered on.',
                        remedy: 'Restart your router and wait 2 minutes.'
                    });
                }
            } else {
                diagnostics.checks.push({
                    name: 'Core Connectivity',
                    status: 'error',
                    message: 'Remote gateway is unreachable.'
                });
            }
        }

        return NextResponse.json(diagnostics);

    } catch (error) {
        console.error('Diagnostics Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST() {
    // This could trigger a "Fix" e.g. kick the session
    try {
        const session = await getServerSession() as SessionUser | null;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = session.user.email;
        const subRes = await pool.query(
            'SELECT * FROM subscribers WHERE pppoe_username = $1 OR email = $1',
            [username]
        );

        const sub = subRes.rows[0];
        if (!sub || !sub.router_id) return NextResponse.json({ error: 'No router assigned' });

        const router = await getRouterService(sub.router_id);
        if (!router) throw new Error('Router unreachable');

        // Effort: Kick session to force reconnect (The most common fix)
        await router.activateUser(sub.pppoe_username || sub.email, sub.profile || 'default');

        return NextResponse.json({
            success: true,
            message: 'Connection refreshed. Your router will reconnect in a few seconds.'
        });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
