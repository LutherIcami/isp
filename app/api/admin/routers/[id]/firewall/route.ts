import { NextResponse } from 'next/server';
import { getRouterService } from '@/lib/mikrotik';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routerId = parseInt(params.id);
        const service = await getRouterService(routerId);
        if (!service) return NextResponse.json({ error: 'Router not found' }, { status: 404 });

        const rules = await service.getFirewallRules();
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routerId = parseInt(params.id);
        const service = await getRouterService(routerId);
        if (!service) return NextResponse.json({ error: 'Router not found' }, { status: 404 });

        const body: {
            chain: string;
            action: string;
            protocol?: string;
            src_address?: string;
            dst_address?: string;
            dst_port?: string;
            comment?: string;
        } = await request.json();

        // body should have chain, action, protocol, src_address, dst_address, dst_port, comment
        await service.addFirewallRule({
            chain: body.chain,
            action: body.action,
            protocol: body.protocol,
            'src-address': body.src_address,
            'dst-address': body.dst_address,
            'dst-port': body.dst_port,
            comment: body.comment
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routerId = parseInt(params.id);
        const service = await getRouterService(routerId);
        if (!service) return NextResponse.json({ error: 'Router not found' }, { status: 404 });

        const body: { mikrotikId: string; disabled: boolean } = await request.json();
        const { mikrotikId, disabled } = body;

        await service.toggleFirewallRule(mikrotikId, disabled);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routerId = parseInt(params.id);
        const service = await getRouterService(routerId);
        if (!service) return NextResponse.json({ error: 'Router not found' }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const mikrotikId = searchParams.get('mikrotikId');
        if (!mikrotikId) return NextResponse.json({ error: 'Missing mikrotikId' }, { status: 400 });

        await service.removeFirewallRule(mikrotikId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
