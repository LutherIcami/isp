import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
    user: {
        email: string;
        role: string;
    };
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as SessionUser | null;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: { fullName: string; phone: string } = await req.json();
        const { fullName, phone } = body;
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
