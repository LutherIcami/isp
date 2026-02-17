const { Client } = require('pg');

async function seedPlans() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'isp_management',
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        await client.connect();
        console.log('Seeding plans...');

        await client.query(`
      INSERT INTO plans (name, download_speed, upload_speed, price) VALUES 
      ('Home Basic', '5M', '2M', 1500),
      ('Home Plus', '10M', '5M', 2500),
      ('Business Lite', '20M', '10M', 4500)
    `);

        console.log('Plans seeded successfully.');
        await client.end();
    } catch (err) {
        console.error('Seeding error:', err.message);
        // Ignore duplicates if they exist
        await client.end();
    }
}

seedPlans();
