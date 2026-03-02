import { NextResponse } from 'next/server';
import { MpesaService } from '@/lib/mpesa';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, phone, invoiceId } = await req.json();

        if (!amount || !phone || !invoiceId) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        // Format phone number to 254...
        let formattedPhone = phone.replace(/[^\d]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
            formattedPhone = '254' + formattedPhone;
        }

        const result = await MpesaService.initiateStkPush(
            formattedPhone,
            amount,
            `INV-${invoiceId}`
        );

        if (result.ResponseCode === '0') {
            return NextResponse.json({ message: 'STK Push initiated successfully', data: result });
        } else {
            console.error('M-Pesa Error:', result);
            return NextResponse.json({ error: result.errorMessage || 'Failed to initiate M-Pesa push' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Payment initiation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
