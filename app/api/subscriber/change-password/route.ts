import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;
        if (!session || session.user.role !== 'subscriber') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { current, new: newPassword } = await req.json();
        const email = session.user.email;

        // 1. Verify current password
        const userRes = await pool.query(
            "SELECT id, password FROM subscribers WHERE email = $1",
            [email]
        );

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userRes.rows[0];
        // In real app: if (!(await bcrypt.compare(current, user.password)))
        if (current !== user.password) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // 2. Update password
        // In real app: const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query(
            "UPDATE subscribers SET password = $1 WHERE id = $2",
            [newPassword, user.id]
        );

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
