import { NextResponse } from 'next/server';
import { runBillingCycle } from '@/lib/billing';

export async function POST(request: Request) {
    try {
        // In a real app, you would verify an API key or a secret from a CRON job service
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await runBillingCycle();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Use POST to trigger billing cycle' });
}
