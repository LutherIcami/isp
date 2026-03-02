import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'AirLink ISP <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your AirLink ISP Password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin-bottom: 5px;">AirLink ISP</h1>
                        <p style="color: #64748b; font-size: 14px;">Premium Connectivity Management</p>
                    </div>
                    
                    <h2 style="color: #0f172a; margin-bottom: 20px;">Password Reset Request</h2>
                    
                    <p style="color: #334155; line-height: 1.6; margin-bottom: 30px;">
                        We received a request to reset your password. Click the button below to choose a new password. 
                        This link will expire in 1 hour.
                    </p>
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="${resetLink}" 
                           style="background-color: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 12px; margin-bottom: 10px;">
                        If the button above doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">
                        ${resetLink}
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                    
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        If you didn't request a password reset, you can safely ignore this email.
                        <br><br>
                        © 2026 AirLink ISP Management System
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Mail service error:', err);
        return { success: false, error: err };
    }
}

export async function sendWelcomeEmail(email: string, fullName: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'AirLink ISP <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to AirLink ISP!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin-bottom: 5px;">AirLink ISP</h1>
                        <p style="color: #64748b; font-size: 14px;">Premium Connectivity Management</p>
                    </div>
                    
                    <h2 style="color: #0f172a; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
                    
                    <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
                        Thank you for joining AirLink ISP. Your account has been successfully created.
                    </p>
                    
                    <p style="color: #334155; line-height: 1.6; margin-bottom: 30px;">
                        You can now log in to your dashboard to choose a plan, monitor your usage, and manage your billing.
                    </p>
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login" 
                           style="background-color: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                    
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        If you have any questions, feel free to reply to this email.
                        <br><br>
                        © 2026 AirLink ISP Management System
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Welcome email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Mail service error:', err);
        return { success: false, error: err };
    }
}
