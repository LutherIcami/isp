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
ON CONFLICT (username) DO NOTHING;
-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- connection, billing, payment, admin
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'success';

-- Sample activity logs
INSERT INTO activity_logs (event_type, description) VALUES 
('admin', 'System initialized and database schema applied.'),
('admin', 'Super Admin logged in.'),
('billing', 'Monthly billing cycle automated check completed.');

-- Sample Plans
INSERT INTO plans (name, download_speed, upload_speed, price) VALUES 
('Home Basic', '5M', '2M', 1500),
('Home Plus', '10M', '5M', 2500),
('Business Lite', '20M', '10M', 4500);
-- 9. Boost Logs Table
CREATE TABLE IF NOT EXISTS boost_logs (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES subscribers(id),
    original_plan_name VARCHAR(100),
    boost_type VARCHAR(50), -- turbo, gaming, ultra
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active'
);

ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS boost_expiration TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS churn_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS risk_factors TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 10. Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'technical', -- technical, billing, sales, other
    priority VARCHAR(20) DEFAULT 'medium',   -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'open',      -- open, in-progress, resolved, closed
    assigned_admin_id INTEGER REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Ticket Messages (Conversation Flow)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id INTEGER, -- Can be admin_id or subscriber_id (handled logically)
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Firewall Rules Table
CREATE TABLE IF NOT EXISTS firewall_rules (
    id SERIAL PRIMARY KEY,
    router_id INTEGER REFERENCES routers(id) ON DELETE CASCADE,
    mikrotik_id VARCHAR(50), -- ID from MikroTik
    chain VARCHAR(20) DEFAULT 'forward', -- input, forward, output
    action VARCHAR(20) DEFAULT 'accept',  -- accept, drop, reject, passthrough
    protocol VARCHAR(20),
    src_address VARCHAR(45),
    dst_address VARCHAR(45),
    dst_port VARCHAR(10),
    comment TEXT,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Communication Manifest (Broadcasts)
CREATE TABLE IF NOT EXISTS broadcasts (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'both', -- email, sms, both
    category VARCHAR(50) DEFAULT 'general', -- maintenance, promotional, alert
    sent_by INTEGER REFERENCES admins(id),
    recipients_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Broadcast Individual Logs
CREATE TABLE IF NOT EXISTS broadcast_logs (
    id SERIAL PRIMARY KEY,
    broadcast_id INTEGER REFERENCES broadcasts(id) ON DELETE CASCADE,
    subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'sent', -- sent, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
