import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Check if user exists (admin or subscriber)
        const checkAdmin = await pool.query("SELECT id FROM admins WHERE username = $1", [email]);
        const checkSub = await pool.query("SELECT id FROM subscribers WHERE email = $1", [email]);

        if (checkAdmin.rows.length === 0 && checkSub.rows.length === 0) {
            // Return success anyway to avoid email enumeration
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // 2. Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // 3. Save token
        await pool.query(
            "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
            [email, token, expiresAt]
        );

        // 4. Send actual email
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
