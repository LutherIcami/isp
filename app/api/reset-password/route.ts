import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // 1. Verify token
        const tokenRes = await pool.query(
            "SELECT email FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
            [token]
        );

        if (tokenRes.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        const email = tokenRes.rows[0].email;

        // 2. Update password in both tables (wherever the email exists)
        // In a real app, hash the password
        await pool.query("UPDATE admins SET password = $1 WHERE username = $2", [password, email]);
        await pool.query("UPDATE subscribers SET password = $1 WHERE email = $2", [password, email]);

        // 3. Delete the token
        await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);

        return NextResponse.json({ message: 'Password reset successfully' });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
