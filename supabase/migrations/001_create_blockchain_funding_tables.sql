-- Migration: Create blockchain funding tables
-- Description: Sets up tables for projects, transactions, donations, and email tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE project_status AS ENUM ('active', 'inactive', 'completed', 'cancelled');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create projects table (enhanced)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id TEXT UNIQUE NOT NULL, -- This will match the blockchain project ID
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_wallet_address TEXT NOT NULL,
    target_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    raised_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE,
    status project_status DEFAULT 'active',
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Blockchain specific fields
    contract_address TEXT,
    blockchain_network TEXT DEFAULT 'sepolia',
    funds_withdrawn BOOLEAN DEFAULT FALSE,
    withdrawal_tx_hash TEXT
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tx_hash TEXT UNIQUE NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(20, 8),
    block_number BIGINT,
    block_hash TEXT,
    status transaction_status DEFAULT 'pending',
    network TEXT DEFAULT 'sepolia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    -- Additional metadata
    nonce BIGINT,
    transaction_index INTEGER,
    contract_address TEXT,
    logs JSONB,
    error_message TEXT
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    donor_wallet_address TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    message TEXT,
    status donation_status DEFAULT 'pending',
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    -- Email notification tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    -- Additional donor info (for anonymous donations)
    donor_email TEXT,
    donor_name TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    email_type TEXT NOT NULL, -- 'donation_received', 'donation_sent', 'project_funded', etc.
    subject TEXT NOT NULL,
    template_id TEXT,
    template_data JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Related records
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    wallet_type TEXT NOT NULL, -- 'metamask', 'walletconnect', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint to prevent duplicate connections
    UNIQUE(user_id, wallet_address)
);

-- Create project_analytics table
CREATE TABLE IF NOT EXISTS project_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    total_donations INTEGER DEFAULT 0,
    unique_donors INTEGER DEFAULT 0,
    average_donation DECIMAL(20, 8) DEFAULT 0,
    funding_percentage DECIMAL(5, 2) DEFAULT 0,
    days_remaining INTEGER,
    last_donation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);

CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);

CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_wallet ON donations(donor_wallet_address);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at 
    BEFORE UPDATE ON project_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update project analytics
CREATE OR REPLACE FUNCTION update_project_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when a donation is added or updated
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO project_analytics (project_id, total_donations, unique_donors, average_donation, funding_percentage, last_donation_at)
        SELECT 
            p.id,
            COUNT(d.id),
            COUNT(DISTINCT d.donor_wallet_address),
            AVG(d.amount),
            CASE WHEN p.target_amount > 0 THEN (p.raised_amount / p.target_amount * 100) ELSE 0 END,
            MAX(d.created_at)
        FROM projects p
        LEFT JOIN donations d ON p.id = d.project_id AND d.status = 'completed'
        WHERE p.id = NEW.project_id
        GROUP BY p.id, p.target_amount, p.raised_amount
        ON CONFLICT (project_id) DO UPDATE SET
            total_donations = EXCLUDED.total_donations,
            unique_donors = EXCLUDED.unique_donors,
            average_donation = EXCLUDED.average_donation,
            funding_percentage = EXCLUDED.funding_percentage,
            last_donation_at = EXCLUDED.last_donation_at,
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for project analytics
CREATE TRIGGER trigger_update_project_analytics
    AFTER INSERT OR UPDATE OR DELETE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_project_analytics();

-- Create RLS (Row Level Security) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = creator_id);

-- Donations policies
CREATE POLICY "Donations are viewable by everyone" ON donations FOR SELECT USING (true);
CREATE POLICY "Users can create donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own donations" ON donations FOR UPDATE USING (auth.uid() = donor_id);

-- Transactions policies
CREATE POLICY "Transactions are viewable by everyone" ON transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Email notifications policies
CREATE POLICY "Users can view their own email notifications" ON email_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert email notifications" ON email_notifications FOR INSERT WITH CHECK (true);

-- Wallet connections policies
CREATE POLICY "Users can view their own wallet connections" ON wallet_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wallet connections" ON wallet_connections FOR ALL USING (auth.uid() = user_id);

-- Project analytics policies
CREATE POLICY "Project analytics are viewable by everyone" ON project_analytics FOR SELECT USING (true);