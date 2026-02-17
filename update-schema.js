const { Client } = require('pg');

async function updateSchema() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'isp_management',
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        await client.connect();
        console.log('Updating schema...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'success',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Schema updated successfully.');
        await client.end();
    } catch (err) {
        console.error('Update error:', err.message);
        process.exit(1);
    }
}

updateSchema();
