import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface BulkInvoiceAction {
    invoiceIds: number[];
    action: 'mark_as_paid';
}

export async function POST(request: Request) {
    try {
        const body: BulkInvoiceAction = await request.json();
        const { invoiceIds, action } = body;

        if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return NextResponse.json({ error: 'No invoice IDs provided' }, { status: 400 });
        }

        if (action === 'mark_as_paid') {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Update invoices
                await client.query(
                    `UPDATE invoices SET status = 'paid' WHERE id = ANY($1)`,
                    [invoiceIds]
                );

                // Log activity
                await client.query(
                    `INSERT INTO activity_logs (action, details) 
                     VALUES ($1, $2)`,
                    ['Bulk Payment', `Marked ${invoiceIds.length} invoices as paid manually via bulk action.`]
                );

                await client.query('COMMIT');
                return NextResponse.json({ success: true, count: invoiceIds.length });
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
