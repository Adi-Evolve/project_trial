-- ============================================================================
-- ProjectForge Blockchain Funding System - Complete Database Migration
-- ============================================================================
-- Run this script in your Supabase SQL editor to set up all required tables
-- Make sure to run this as a single script execution
-- ============================================================================

-- Enable Row Level Security extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    raised_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creator_id UUID NOT NULL, -- Will reference auth.users
    blockchain_project_id VARCHAR(255) UNIQUE, -- Maps to smart contract project ID
    contract_address VARCHAR(42), -- Ethereum contract address
    is_active BOOLEAN DEFAULT true,
    funds_withdrawn BOOLEAN DEFAULT false,
    
    -- Constraints
    CONSTRAINT projects_target_amount_positive CHECK (target_amount > 0),
    CONSTRAINT projects_raised_amount_non_negative CHECK (raised_amount >= 0),
    CONSTRAINT projects_deadline_future CHECK (deadline > created_at)
);

-- ============================================================================
-- 2. BLOCKCHAIN_TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL, -- Ethereum transaction hash
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    donor_address VARCHAR(42) NOT NULL, -- Ethereum wallet address
    creator_address VARCHAR(42) NOT NULL, -- Project creator's wallet address
    amount_wei VARCHAR(32) NOT NULL, -- Amount in wei (as string to handle big numbers)
    amount_eth DECIMAL(18,8) NOT NULL, -- Amount in ETH for easier queries
    platform_fee_wei VARCHAR(32) NOT NULL, -- Platform fee in wei
    platform_fee_eth DECIMAL(18,8) NOT NULL, -- Platform fee in ETH
    creator_amount_wei VARCHAR(32) NOT NULL, -- Amount for creator in wei
    creator_amount_eth DECIMAL(18,8) NOT NULL, -- Amount for creator in ETH
    gas_used INTEGER,
    gas_price VARCHAR(32), -- Gas price in wei
    block_number INTEGER,
    block_hash VARCHAR(66),
    transaction_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    transferred_to_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT tx_status_check CHECK (transaction_status IN ('pending', 'confirmed', 'failed')),
    CONSTRAINT tx_amounts_positive CHECK (amount_eth > 0 AND creator_amount_eth >= 0 AND platform_fee_eth >= 0)
);

-- ============================================================================
-- 3. DONATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES blockchain_transactions(id) ON DELETE CASCADE,
    donor_id UUID, -- Optional: if user is registered, references auth.users
    donor_address VARCHAR(42) NOT NULL, -- Always have the wallet address
    donor_email VARCHAR(255), -- Optional: for email notifications
    amount_eth DECIMAL(18,8) NOT NULL,
    platform_fee_eth DECIMAL(18,8) NOT NULL,
    creator_amount_eth DECIMAL(18,8) NOT NULL,
    message TEXT, -- Optional donation message
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT donations_amount_positive CHECK (amount_eth > 0)
);

-- ============================================================================
-- 4. EMAIL_NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES blockchain_transactions(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- 'donor' or 'creator'
    template_id VARCHAR(100) NOT NULL, -- EmailJS template ID
    email_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT email_recipient_type_check CHECK (recipient_type IN ('donor', 'creator')),
    CONSTRAINT email_status_check CHECK (email_status IN ('pending', 'sent', 'failed'))
);

-- ============================================================================
-- 5. PLATFORM_SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID -- References auth.users
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('platform_fee_percentage', '2.5', 'Platform fee percentage (2.5% = 250 basis points)'),
('contract_address', '0x08650905d1fC20cF136cF3d4bD2BCc82c782BE66', 'Main project funding smart contract address'),
('sepolia_rpc_url', 'https://sepolia.infura.io/v3/a824d31631e843709686c805623a8eb1', 'Sepolia testnet RPC URL'),
('email_service_provider', 'emailjs', 'Email service provider being used'),
('platform_wallet_address', '', 'Platform wallet address for fee collection')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();

-- ============================================================================
-- 6. PROJECT_ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate metrics for same project/date
    UNIQUE(project_id, metric_name, metric_date)
);

-- ============================================================================
-- 7. TRANSACTION_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES blockchain_transactions(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error'
    log_message TEXT NOT NULL,
    log_data JSONB, -- Additional structured data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT log_level_check CHECK (log_level IN ('info', 'warning', 'error'))
);

-- ============================================================================
-- 8. PENDING_WITHDRAWALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    creator_address VARCHAR(42) NOT NULL,
    amount_wei VARCHAR(32) NOT NULL,
    amount_eth DECIMAL(18,8) NOT NULL,
    withdrawal_status VARCHAR(20) DEFAULT 'pending', -- pending, processed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    transaction_hash VARCHAR(66), -- Hash of withdrawal transaction
    
    -- Constraints
    CONSTRAINT withdrawal_status_check CHECK (withdrawal_status IN ('pending', 'processed', 'failed')),
    CONSTRAINT withdrawal_amount_positive CHECK (amount_eth > 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_blockchain_id ON projects(blockchain_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Blockchain transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON blockchain_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_donor_address ON blockchain_transactions(donor_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON blockchain_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON blockchain_transactions(created_at);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_address ON donations(donor_address);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Email notifications indexes
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(email_status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_project_date ON project_analytics(project_id, metric_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_withdrawals ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Anyone can view active projects" ON projects
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their projects" ON projects
    FOR UPDATE USING (creator_id = auth.uid());

-- Blockchain transactions policies (readable by all, insertable by service)
CREATE POLICY "Anyone can view confirmed transactions" ON blockchain_transactions
    FOR SELECT USING (transaction_status = 'confirmed');

CREATE POLICY "Service can insert transactions" ON blockchain_transactions
    FOR INSERT WITH CHECK (true); -- Service role will handle this

-- Donations policies
CREATE POLICY "Anyone can view non-anonymous donations" ON donations
    FOR SELECT USING (is_anonymous = false);

CREATE POLICY "Service can insert donations" ON donations
    FOR INSERT WITH CHECK (true); -- Service role will handle this

-- Email notifications policies (restricted to service)
CREATE POLICY "Service can manage email notifications" ON email_notifications
    FOR ALL WITH CHECK (true); -- Service role only

-- Platform settings policies (readable by all, updatable by admin)
CREATE POLICY "Anyone can view platform settings" ON platform_settings
    FOR SELECT USING (true);

-- Analytics policies
CREATE POLICY "Anyone can view project analytics" ON project_analytics
    FOR SELECT USING (true);

-- Transaction logs policies (service only)
CREATE POLICY "Service can manage transaction logs" ON transaction_logs
    FOR ALL WITH CHECK (true);

-- Pending withdrawals policies
CREATE POLICY "Service can manage pending withdrawals" ON pending_withdrawals
    FOR ALL WITH CHECK (true);

-- ============================================================================
-- USEFUL VIEWS FOR QUERIES
-- ============================================================================

-- View: Project funding summary
CREATE OR REPLACE VIEW project_funding_summary AS
SELECT 
    p.id,
    p.title,
    p.target_amount,
    p.raised_amount,
    p.deadline,
    p.creator_id,
    p.blockchain_project_id,
    COUNT(d.id) as donation_count,
    AVG(d.amount_eth) as avg_donation_amount,
    MAX(d.created_at) as last_donation_date,
    (p.raised_amount / p.target_amount * 100) as funding_percentage
FROM projects p
LEFT JOIN donations d ON p.id = d.project_id
WHERE p.is_active = true
GROUP BY p.id, p.title, p.target_amount, p.raised_amount, p.deadline, p.creator_id, p.blockchain_project_id;

-- View: Transaction summary with project details
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    bt.id,
    bt.transaction_hash,
    bt.amount_eth,
    bt.platform_fee_eth,
    bt.creator_amount_eth,
    bt.transaction_status,
    bt.created_at,
    p.title as project_title,
    p.blockchain_project_id,
    d.donor_email,
    d.message as donation_message
FROM blockchain_transactions bt
JOIN projects p ON bt.project_id = p.id
LEFT JOIN donations d ON bt.id = d.transaction_id
ORDER BY bt.created_at DESC;

-- ============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function: Update project raised amount
CREATE OR REPLACE FUNCTION update_project_raised_amount(project_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE projects 
    SET raised_amount = (
        SELECT COALESCE(SUM(creator_amount_eth), 0)
        FROM donations 
        WHERE project_id = project_uuid
    ),
    updated_at = NOW()
    WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get project donation statistics
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE(
    total_donations BIGINT,
    total_raised DECIMAL(18,8),
    total_fees DECIMAL(18,8),
    unique_donors BIGINT,
    avg_donation DECIMAL(18,8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_donations,
        COALESCE(SUM(amount_eth), 0) as total_raised,
        COALESCE(SUM(platform_fee_eth), 0) as total_fees,
        COUNT(DISTINCT donor_address)::BIGINT as unique_donors,
        COALESCE(AVG(amount_eth), 0) as avg_donation
    FROM donations 
    WHERE project_id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger: Update project raised amount when donation is added
CREATE OR REPLACE FUNCTION trigger_update_project_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_project_raised_amount(NEW.project_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donation_update_project_amount
    AFTER INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_project_raised_amount();

-- Trigger: Update timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================================================

-- Insert a sample project (you can remove this if not needed)
-- INSERT INTO projects (
--     title, 
--     description, 
--     category, 
--     target_amount, 
--     deadline, 
--     creator_id, 
--     blockchain_project_id
-- ) VALUES (
--     'Sample Blockchain Project',
--     'A test project for blockchain funding',
--     'Technology',
--     1.0,
--     NOW() + INTERVAL '30 days',
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
--     'sample-project-1'
-- );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Create a migration log entry
CREATE TABLE IF NOT EXISTS migration_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed'
);

INSERT INTO migration_log (migration_name, status) 
VALUES ('blockchain_funding_system_complete', 'completed');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'ProjectForge Blockchain Funding System migration completed successfully!';
    RAISE NOTICE 'Created tables: projects, blockchain_transactions, donations, email_notifications, platform_settings, project_analytics, transaction_logs, pending_withdrawals';
    RAISE NOTICE 'Created views: project_funding_summary, transaction_summary';
    RAISE NOTICE 'Created functions: update_project_raised_amount, get_project_stats';
    RAISE NOTICE 'RLS policies enabled on all tables';
    RAISE NOTICE 'Ready for blockchain funding operations!';
END $$;