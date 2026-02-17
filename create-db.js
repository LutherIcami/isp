const { Client } = require('pg');

async function setupDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres' // Connect to default database
    });

    try {
        await client.connect();
        console.log('Connected to default postgres database.');

        const dbName = process.env.DB_NAME || 'isp_management';

        // Check if database exists
        const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

        if (checkRes.rows.length === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }

        await client.end();
    } catch (err) {
        console.error('Setup error:', err.message);
        process.exit(1);
    }
}

setupDatabase();
