const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'isp_management',
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        const schemaPath = path.join(__dirname, 'db.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await client.connect();
        console.log('Connected to isp_management. Applying schema...');

        // Simple split by semicolon might be dangerous if semicolons are inside strings,
        // but for this standard schema it should be okay.
        // A better way is to execute the whole block if possible, or use a proper parser.
        // Postgres client can execute multiple statements in one query call.
        await client.query(sql);

        console.log('Schema applied successfully.');
        await client.end();
    } catch (err) {
        console.error('Schema application error:', err.message);
        process.exit(1);
    }
}

applySchema();
