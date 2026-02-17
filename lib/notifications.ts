/**
 * Notification Service for SkyNet ISP
 * This handles automated communication via Email and SMS.
 */

export interface NotificationPayload {
    to: string;
    subject?: string;
    message: string;
    type: 'email' | 'sms';
}

export class NotificationService {
    /**
     * Send a notification.
     * In a production environment, this would call Twilio, Resend, or AWS SES.
     */
    static async send(payload: NotificationPayload) {
        const { to, subject, message, type } = payload;

        console.log(`[NOTIFICATION][${type.toUpperCase()}] to: ${to} | ${subject ? `Subject: ${subject} | ` : ''}Message: ${message}`);

        // Mocking external API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, timestamp: new Date().toISOString() });
            }, 500);
        });
    }

    /**
     * Specific helper for Payment Confirmation
     */
    static async sendPaymentReceipt(phone: string, name: string, amount: number, transactionId: string) {
        const msg = `Hello ${name}, we have received your payment of KES ${amount.toLocaleString()}. Ref: ${transactionId}. Your internet service is active. Thank you! - SkyNet Wifi`;
        return this.send({ to: phone, message: msg, type: 'sms' });
    }

    /**
     * Specific helper for Billing Reminders
     */
    static async sendBillingReminder(phone: string, name: string, amount: number, dueDate: string) {
        const msg = `Dear ${name}, your internet bill of KES ${amount.toLocaleString()} is due on ${dueDate}. Please pay to avoid service interruption. Pay via Till: 554433. - SkyNet Wifi`;
        return this.send({ to: phone, message: msg, type: 'sms' });
    }

    /**
     * Notification for network outages (Staff only)
     */
    static async alertStaff(routerName: string, status: string) {
        const msg = `ALERT: Router node [${routerName}] is now ${status.toUpperCase()}. Please check physical connection.`;
        // In reality, this might go to a Telegram bot or Slack
        return this.send({ to: 'ADMIN_PHONE', message: msg, type: 'sms' });
    }
}
