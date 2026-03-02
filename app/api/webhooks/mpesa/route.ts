import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface MpesaMetadataItem {
    Name: string;
    Value?: string | number;
}

interface MpesaWebhookPayload {
    TransID?: string;
    MSISDN?: string;
    BillRefNumber?: string;
    AccountReference?: string;
    Body?: {
        stkCallback?: {
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: MpesaMetadataItem[];
            };
        };
    };
}

/**
 * M-Pesa C2B/LNM Webhook Handler for Automated Reconciliation
 * Expects M-Pesa API standard payload
 */
export async function POST(request: Request) {
    try {
        const payload: MpesaWebhookPayload = await request.json();

        // M-Pesa payload usually nested in Body.stkCallback or similar for LNM,
        // or direct for C2B Confirmation.
        const callbackData = payload.Body?.stkCallback || payload;

        const resultCode = (callbackData as any).ResultCode;
        const resultDesc = (callbackData as any).ResultDesc;

        if (resultCode !== undefined && resultCode !== 0) {
            console.log(`M-Pesa Transaction Failed: ${resultDesc}`);
            return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        // Extract Metadata
        const metadata = (callbackData as any).CallbackMetadata?.Item || [];
        const amount = metadata.find((i: MpesaMetadataItem) => i.Name === 'Amount')?.Value || (payload as any).TransAmount;
        const mpesaReceipt = metadata.find((i: MpesaMetadataItem) => i.Name === 'MpesaReceiptNumber')?.Value || payload.TransID;
        const phoneNumber = metadata.find((i: MpesaMetadataItem) => i.Name === 'PhoneNumber')?.Value || payload.MSISDN;
        const accountRef = payload.BillRefNumber || payload.AccountReference || metadata.find((i: MpesaMetadataItem) => i.Name === 'AccountReference')?.Value;

        if (!amount || !mpesaReceipt) {
            return NextResponse.json({ error: "Invalid payload nodes" }, { status: 400 });
        }

        console.log(`Processing M-Pesa Payment: ${mpesaReceipt} | ${amount} | Ref: ${accountRef}`);

        // RECONCILIATION LOGIC
        // 1. Find the Subscriber by Phone or Account Reference
        let subscriberId = null;
        let invoiceId = null;

        // Try matching by reference (Account Number)
        const subRes = await pool.query(
            `SELECT s.id, s.status, i.id as pending_invoice_id 
             FROM subscribers s 
             LEFT JOIN invoices i ON s.id = i.subscriber_id AND i.status = 'unpaid'
             WHERE s.phone = $1 OR s.mikrotik_username = $2
             LIMIT 1`,
            [phoneNumber.toString(), accountRef]
        );

        if (subRes.rows.length > 0) {
            subscriberId = subRes.rows[0].id;
            invoiceId = subRes.rows[0].pending_invoice_id;

            // 2. Log Payment
            await pool.query(
                `INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, notes)
                 VALUES ($1, $2, $3, $4, $5)`,
                [invoiceId, amount, 'M-Pesa', mpesaReceipt, `Automated Webhook Recon: ${phoneNumber}`]
            );

            // 3. Update Invoice Status
            if (invoiceId) {
                await pool.query(
                    `UPDATE invoices SET status = 'paid' WHERE id = $1`,
                    [invoiceId]
                );
            }

            // 4. Reactive Subscriber if suspended
            if (subRes.rows[0].status === 'suspended') {
                await pool.query(
                    `UPDATE subscribers SET status = 'active' WHERE id = $1`,
                    [subscriberId]
                );

                // MIKROTIK SYNC (Optional: Here we'd call the MikroTik API to unblock)
                console.log(`Subscriber ${subscriberId} reactivated via webhook.`);
            }

            // 5. Audit Log
            await pool.query(
                `INSERT INTO activity_logs (event_type, description, status)
                 VALUES ($1, $2, $3)`,
                ['payment', `M-Pesa Reconciliation Successful: ${mpesaReceipt} for ${accountRef}`, 'success']
            );
        } else {
            // Log as un-reconciled (Suspense Account)
            await pool.query(
                `INSERT INTO activity_logs (event_type, description, status)
                 VALUES ($1, $2, $3)`,
                ['payment', `M-Pesa Ghost Payment Recieved: ${mpesaReceipt} | Mobile: ${phoneNumber}`, 'error']
            );
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    } catch (error) {
        console.error('M-Pesa Webhook Error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
