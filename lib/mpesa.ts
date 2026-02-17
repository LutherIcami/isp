/**
 * M-Pesa Daraja API Integration Helper
 */

export class MpesaService {
    private static getCredentials() {
        return {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            shortCode: process.env.MPESA_SHORTCODE || '',
            passKey: process.env.MPESA_PASSKEY || '',
            env: process.env.MPESA_ENV || 'sandbox' // sandbox or production
        };
    }

    private static async getAccessToken() {
        const { consumerKey, consumerSecret } = this.getCredentials();
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        const response = await fetch(url, {
            headers: { Authorization: `Basic ${auth}` }
        });

        const data = await response.json();
        return data.access_token;
    }

    static async initiateStkPush(phoneNumber: string, amount: number, accountReference: string) {
        const { shortCode, passKey } = this.getCredentials();
        const token = await this.getAccessToken();

        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

        const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        const body = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mpesa/callback`,
            AccountReference: accountReference,
            TransactionDesc: `Internet Payment ${accountReference}`
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        return await response.json();
    }
}
