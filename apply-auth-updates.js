const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyAuthUpdates() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'isp_management',
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        await client.connect();
        console.log('Applying auth updates...');

        const sql = fs.readFileSync(path.join(__dirname, 'auth_updates.sql'), 'utf8');
        await client.query(sql);

        console.log('Auth updates applied successfully.');
        await client.end();
    } catch (err) {
        console.error('Update error:', err.message);
        process.exit(1);
    }
}

applyAuthUpdates();

