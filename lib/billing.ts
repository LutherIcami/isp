import pool from './db';

export async function runBillingCycle() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const today = new Date().toISOString().split('T')[0];

        // 1. Get subscribers due for billing
        const res = await client.query(
            `SELECT s.*, p.price, p.billing_cycle 
       FROM subscribers s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.status IN ('active', 'suspended') 
       AND (s.next_billing_date <= $1 OR s.next_billing_date IS NULL)`,
            [today]
        );

        const subscribers = res.rows;
        console.log(`Found ${subscribers.length} subscribers due for billing.`);

        for (const sub of subscribers) {
            // Create Invoice
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // 7 days grace period
            const dueDateStr = dueDate.toISOString().split('T')[0];

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

            // Log activity
            await client.query(
                `INSERT INTO activity_logs (subscriber_id, action, details) VALUES ($1, $2, $3)`,
                [sub.id, 'Invoice Generated', `Generated invoice of KES ${sub.price} for period starting ${periodStart}`]
            );

            console.log(`Generated invoice for ${sub.full_name} (ID: ${sub.id})`);
        }

        // 2. Check for overdue invoices and suspend users
        const overdueRes = await client.query(
            `SELECT DISTINCT i.subscriber_id, s.full_name 
       FROM invoices i 
       JOIN subscribers s ON i.subscriber_id = s.id
       WHERE i.status = 'unpaid' AND i.due_date < $1 AND s.status = 'active'`,
            [today]
        );

        const overdueSubscribers = overdueRes.rows;
        for (const sub of overdueSubscribers) {
            // 1. Update Database Status
            await client.query(
                `UPDATE subscribers SET status = 'suspended' WHERE id = $1`,
                [sub.subscriber_id]
            );

            // Log suspension activity
            await client.query(
                `INSERT INTO activity_logs (subscriber_id, action, details) VALUES ($1, $2, $3)`,
                [sub.subscriber_id, 'Subscriber Suspended', `Suspended due to overdue payment for ${sub.full_name}`]
            );

            // 2. Call MikroTik API to Suspend (Outside main transaction to handle failures gracefully)
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
                console.error(`Failed to suspend user ${sub.full_name} on MikroTik:`, mikrotikError);
                // We still committed the DB status change, but MikroTik might still allow traffic if this failed.
            }

            console.log(`Suspended subscriber: ${sub.full_name} due to overdue invoice.`);
        }

        await client.query('COMMIT');
        return { success: true, processed: subscribers.length, suspended: overdueSubscribers.length };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Billing Cycle Error:', error);
        throw error;
    } finally {
        client.release();
    }
}
