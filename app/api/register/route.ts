import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { fullName, email, phone, password } = await req.json();

        // 1. Basic validation
        if (!fullName || !email || !phone || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // 2. Check if user already exists
        const userExists = await pool.query(
            "SELECT id FROM subscribers WHERE email = $1 OR phone = $2",
            [email, phone]
        );

        if (userExists.rows.length > 0) {
            return NextResponse.json({ error: 'Email or phone already registered' }, { status: 400 });
        }

        // 3. Create subscriber
        // In a real app, hash the password: const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO subscribers (full_name, email, phone, password, status) VALUES ($1, $2, $3, $4, 'inactive') RETURNING id",
            [fullName, email, phone, password]
        );

        // 4. Send welcome email
        await sendWelcomeEmail(email, fullName);

        return NextResponse.json({
            message: 'Registration successful',
            userId: result.rows[0].id
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
