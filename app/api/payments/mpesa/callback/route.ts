import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('M-Pesa Callback Received:', JSON.stringify(body));

        const result = body.Body.stkCallback;

        if (result.ResultCode === 0) {
            // Payment Successful
            const metadata = result.CallbackMetadata.Item;
            const amount = metadata.find((i: any) => i.Name === 'Amount').Value;
            const mpesaReceipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber').Value;
            const phoneNumber = metadata.find((i: any) => i.Name === 'PhoneNumber').Value;

            // The AccountReference or CheckoutRequestID usually helps link to the invoice
            const checkoutID = result.CheckoutRequestID;

            // 1. Find the invoice linked to this payment (stored in a temporary table or via checkoutID)
            // For this simplified logic, we'll assume we know which invoice it's for 
            // In a real app, you'd have a 'pending_transactions' table

            // Update Database - Add Payment record
            await pool.query(
                `INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, notes) 
         SELECT id, $1, 'M-Pesa', $2, $3 FROM invoices 
         WHERE status = 'unpaid' AND subscriber_id = (SELECT id FROM subscribers WHERE phone LIKE $4)
         LIMIT 1`,
                [amount, mpesaReceipt, `STK Push: ${checkoutID}`, `%${phoneNumber.toString().slice(-9)}`]
            );

            // Update Invoice status to paid
            await pool.query(
                `UPDATE invoices SET status = 'paid' 
         WHERE status = 'unpaid' AND subscriber_id = (SELECT id FROM subscribers WHERE phone LIKE $1)
         LIMIT 1`,
                [`%${phoneNumber.toString().slice(-9)}`]
            );

            // 2. Reactivate Subscriber if suspended
            const subRes = await pool.query(
                `UPDATE subscribers SET status = 'active' 
         WHERE status = 'suspended' AND phone LIKE $1 
         RETURNING id, mikrotik_username, router_id, plan_id`,
                [`%${phoneNumber.toString().slice(-9)}`]
            );

            // 3. Proactively call MikroTik to reactivate
            if (subRes.rows.length > 0) {
                const sub = subRes.rows[0];
                if (sub.router_id && sub.mikrotik_username) {
                    const { getRouterService } = await import('@/lib/mikrotik');

                    const planRes = await pool.query('SELECT * FROM plans WHERE id = $1', [sub.plan_id]);
                    if (planRes.rows.length > 0) {
                        const plan = planRes.rows[0];
                        const routerService = await getRouterService(sub.router_id);
                        if (routerService) {
                            await routerService.activateUser(sub.mikrotik_username, `${plan.download_speed}/${plan.upload_speed}`);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    } catch (error: any) {
        console.error('M-Pesa Callback Error:', error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
    }
}
