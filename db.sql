-- ISP Management System Database Schema (PostgreSQL)

-- 1. Routers Table
CREATE TABLE IF NOT EXISTS routers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    api_port INTEGER DEFAULT 8728,
    status VARCHAR(20) DEFAULT 'online', -- online, offline, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Plans/Packages Table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    download_speed VARCHAR(20) NOT NULL, -- e.g., '5M' or '10M'
    upload_speed VARCHAR(20) NOT NULL,   -- e.g., '2M' or '5M'
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly
    data_limit_gb INTEGER DEFAULT NULL, -- NULL means unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    router_id INTEGER REFERENCES routers(id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
    mikrotik_username VARCHAR(100), -- PPPoE or Hotspot username
    mikrotik_password VARCHAR(100),
    ip_binding VARCHAR(45),
    mac_binding VARCHAR(17),
    status VARCHAR(20) DEFAULT 'inactive', -- active, suspended, expired, inactive
    billing_day INTEGER DEFAULT 1, -- Day of the month to bill
    last_billing_date DATE,
    next_billing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, partially_paid, cancelled, overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'M-Pesa', 'Cash', 'Bank Transfer'
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 6. Usage Tracking (Optional for logs)
CREATE TABLE IF NOT EXISTS usage_logs (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    bytes_in BIGINT DEFAULT 0,
    bytes_out BIGINT DEFAULT 0,
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE
);

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed password
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin if not exists (Password: Admin@1234 - in real app, this should be hashed)
INSERT INTO admins (username, password, full_name, role) 
VALUES ('admin@airlink.com', 'Admin@1234', 'Super Admin', 'admin')
-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- connection, billing, payment, admin
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample activity logs
INSERT INTO activity_logs (event_type, description) VALUES 
('admin', 'System initialized and database schema applied.'),
('admin', 'Super Admin logged in.'),
('billing', 'Monthly billing cycle automated check completed.');

-- Sample Plans
INSERT INTO plans (name, download_speed, upload_speed, price) VALUES 
('Home Basic', '5M', '2M', 1500),
('Home Plus', '10M', '5M', 2500),
('Business Lite', '20M', '10M', 4500)
ON CONFLICT DO NOTHING;
