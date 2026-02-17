const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'isp_management',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DB_NAME);
        const res = await pool.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables found:', tables.rows.map(r => r.table_name));

        await pool.end();
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

testConnection();
