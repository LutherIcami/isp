import pool from './db';

interface BillingSubscriber {
    id: number;
    full_name: string;
    next_billing_date: string | null;
    billing_cycle: 'monthly' | 'weekly' | 'daily';
    price: string | number;
    plan_name: string;
    router_id: number | null;
    mikrotik_username: string | null;
}

interface OverdueSubscriber {
    subscriber_id: number;
    full_name: string;
    amount: string | number;
}

export async function runBillingCycle() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const today = new Date().toISOString().split('T')[0];
        const logEntries: string[] = [];

        // 1. Get subscribers due for billing
        const res = await client.query(
            `SELECT s.*, p.price, p.billing_cycle, p.name as plan_name
       FROM subscribers s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.status IN ('active', 'suspended') 
       AND (s.next_billing_date <= $1 OR s.next_billing_date IS NULL)`,
            [today]
        );

        const subscribers: BillingSubscriber[] = res.rows;

        for (const sub of subscribers) {
            const periodStart = sub.next_billing_date || today;
            const periodEnd = new Date(periodStart);
            if (sub.billing_cycle === 'monthly') {
                periodEnd.setMonth(periodEnd.getMonth() + 1);
            } else if (sub.billing_cycle === 'weekly') {
                periodEnd.setDate(periodEnd.getDate() + 7);
            } else {
                periodEnd.setDate(periodEnd.getDate() + 1);
            }
            const periodEndStr = periodEnd.toISOString().split('T')[0];

            // Check if invoice for this period already exists (Idempotency)
            const duplicateCheck = await client.query(
                'SELECT id FROM invoices WHERE subscriber_id = $1 AND billing_period_start = $2',
                [sub.id, periodStart]
            );

            if (duplicateCheck.rows.length > 0) {
                logEntries.push(`Skipped ${sub.full_name}: Invoice already exists for ${periodStart}`);
                continue;
            }

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            const dueDateStr = dueDate.toISOString().split('T')[0];

            // Insert Invoice
            await client.query(
                `INSERT INTO invoices (subscriber_id, amount, billing_period_start, billing_period_end, due_date, status) 
         VALUES ($1, $2, $3, $4, $5, 'unpaid')`,
                [sub.id, sub.price, periodStart, periodEndStr, dueDateStr]
            );

            // Update Subscriber next billing date
            await client.query(
                `UPDATE subscribers SET last_billing_date = $1, next_billing_date = $2 WHERE id = $3`,
                [periodStart, periodEndStr, sub.id]
            );

            // Detailed Activity Log
            await client.query(
                `INSERT INTO activity_logs (subscriber_id, action, details, status) VALUES ($1, $2, $3, $4)`,
                [sub.id, 'Invoicing', `Renewal automated: ${sub.plan_name} for period ${periodStart} to ${periodEndStr}. Amount: KES ${sub.price}`, 'success']
            );

            logEntries.push(`Invoiced ${sub.full_name}: KES ${sub.price} for ${periodStart} node cycle.`);
        }

        // 2. Overdue Logic
        const overdueRes = await client.query(
            `SELECT DISTINCT i.subscriber_id, s.full_name, i.amount 
       FROM invoices i 
       JOIN subscribers s ON i.subscriber_id = s.id
       WHERE i.status = 'unpaid' AND i.due_date < $1 AND s.status = 'active'`,
            [today]
        );

        const overdueSubscribers: OverdueSubscriber[] = overdueRes.rows;
        for (const sub of overdueSubscribers) {
            await client.query(
                `UPDATE subscribers SET status = 'suspended' WHERE id = $1`,
                [sub.subscriber_id]
            );

            await client.query(
                `UPDATE invoices SET status = 'overdue' WHERE subscriber_id = $1 AND status = 'unpaid'`,
                [sub.subscriber_id]
            );

            await client.query(
                `INSERT INTO activity_logs (subscriber_id, action, details, status) VALUES ($1, $2, $3, $4)`,
                [sub.subscriber_id, 'Suspension', `Account restricted: Non-payment of KES ${sub.amount}. Grace period of 7 days exceeded.`, 'error']
            );

            // MikroTik Sync
            try {
                const subDetailRes = await client.query('SELECT router_id, mikrotik_username FROM subscribers WHERE id = $1', [sub.subscriber_id]);
                if (subDetailRes.rows.length > 0 && subDetailRes.rows[0].router_id) {
                    const { router_id, mikrotik_username } = subDetailRes.rows[0];
                    const { getRouterService } = await import('./mikrotik');
                    const routerService = await getRouterService(router_id);
                    if (routerService && mikrotik_username) {
                        await routerService.suspendUser(mikrotik_username);
                    }
                }
            } catch (mikrotikError) {
                console.error(`MikroTik Sync Fail: ${sub.full_name}`, mikrotikError);
            }
        }

        await client.query('COMMIT');
        return {
            success: true,
            processed: logEntries.length,
            suspended: overdueSubscribers.length,
            logs: logEntries
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
