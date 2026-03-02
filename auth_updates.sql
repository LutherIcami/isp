-- Updates for Authentication and Password Reset

-- 1. Add password column to subscribers table
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 2. Create Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
