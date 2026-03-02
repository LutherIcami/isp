import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fullName, phone } = await req.json();
        const email = session.user.email;

        if (!fullName || !phone) {
            return NextResponse.json({ error: 'Missing information' }, { status: 400 });
        }

        await pool.query(
            "UPDATE subscribers SET full_name = $1, phone = $2 WHERE email = $3",
            [fullName, phone, email]
        );

        return NextResponse.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
