-- Enhanced User Verification Database Schema
-- This file contains the database schema for the advanced user verification system

-- User profiles table with verification status
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('PROJECT_CREATOR', 'NGO_CREATOR', 'BACKER')),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_comments TEXT,
    verified_by VARCHAR(255),
    
    -- Indexes for performance
    INDEX idx_user_profiles_email (email),
    INDEX idx_user_profiles_verification_status (verification_status),
    INDEX idx_user_profiles_user_type (user_type),
    INDEX idx_user_profiles_created_at (created_at)
);

-- User documents table for IPFS document storage
CREATE TABLE IF NOT EXISTS user_documents (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhar', 'pan', 'ngo_certificate', 'address_proof', 'photo', 'other')),
    document_name VARCHAR(255) NOT NULL,
    ipfs_hash VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_comments TEXT,
    verified_by VARCHAR(255),
    metadata JSONB,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_documents_user_id (user_id),
    INDEX idx_user_documents_document_type (document_type),
    INDEX idx_user_documents_verification_status (verification_status),
    INDEX idx_user_documents_uploaded_at (uploaded_at),
    INDEX idx_user_documents_ipfs_hash (ipfs_hash)
);

-- Additional user information table (for NGOs and detailed profiles)
CREATE TABLE IF NOT EXISTS user_additional_info (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    organization_name VARCHAR(255),
    registration_number VARCHAR(255),
    address TEXT,
    contact_number VARCHAR(20),
    website_url VARCHAR(255),
    social_media_links JSONB,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_additional_info_user_id (user_id),
    INDEX idx_user_additional_info_organization_name (organization_name)
);

-- Oracle reputation system for verifiers
CREATE TABLE IF NOT EXISTS oracle_reputation (
    id SERIAL PRIMARY KEY,
    oracle_address VARCHAR(255) NOT NULL UNIQUE,
    total_votes INTEGER DEFAULT 0,
    correct_votes INTEGER DEFAULT 0,
    reputation_score DECIMAL(10, 4) DEFAULT 0.0000,
    stake_amount DECIMAL(36, 18) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_oracle_reputation_address (oracle_address),
    INDEX idx_oracle_reputation_score (reputation_score),
    INDEX idx_oracle_reputation_active (is_active)
);

-- Oracle voting records for milestone verification
CREATE TABLE IF NOT EXISTS oracle_votes (
    id SERIAL PRIMARY KEY,
    oracle_address VARCHAR(255) NOT NULL,
    campaign_id VARCHAR(255) NOT NULL,
    milestone_index INTEGER NOT NULL,
    vote BOOLEAN NOT NULL, -- true for approve, false for reject
    reasoning TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per oracle per milestone
    UNIQUE(oracle_address, campaign_id, milestone_index),
    
    -- Foreign key to oracle reputation
    FOREIGN KEY (oracle_address) REFERENCES oracle_reputation(oracle_address) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_oracle_votes_oracle_address (oracle_address),
    INDEX idx_oracle_votes_campaign_milestone (campaign_id, milestone_index),
    INDEX idx_oracle_votes_voted_at (voted_at)
);

-- ZKP commitment tracking for privacy system
CREATE TABLE IF NOT EXISTS zkp_commitments (
    id SERIAL PRIMARY KEY,
    commitment_hash VARCHAR(255) NOT NULL UNIQUE,
    campaign_id VARCHAR(255) NOT NULL,
    amount_commitment VARCHAR(255) NOT NULL, -- Encrypted amount commitment
    nullifier_hash VARCHAR(255), -- For preventing double spending
    proof_data JSONB NOT NULL, -- ZK proof parameters
    is_nullified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nullified_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_zkp_commitments_commitment_hash (commitment_hash),
    INDEX idx_zkp_commitments_campaign_id (campaign_id),
    INDEX idx_zkp_commitments_nullifier_hash (nullifier_hash),
    INDEX idx_zkp_commitments_created_at (created_at)
);

-- Multisig wallet transactions tracking
CREATE TABLE IF NOT EXISTS multisig_transactions (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255) UNIQUE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('fund_release', 'emergency_pause', 'parameter_update', 'owner_management')),
    target_address VARCHAR(255),
    amount DECIMAL(36, 18),
    data_payload TEXT,
    required_confirmations INTEGER NOT NULL,
    current_confirmations INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'rejected', 'expired')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_multisig_transactions_wallet_address (wallet_address),
    INDEX idx_multisig_transactions_status (status),
    INDEX idx_multisig_transactions_created_at (created_at)
);

-- Multisig transaction confirmations
CREATE TABLE IF NOT EXISTS multisig_confirmations (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    confirmer_address VARCHAR(255) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one confirmation per owner per transaction
    UNIQUE(transaction_id, confirmer_address),
    
    -- Foreign key constraint
    FOREIGN KEY (transaction_id) REFERENCES multisig_transactions(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_multisig_confirmations_transaction_id (transaction_id),
    INDEX idx_multisig_confirmations_confirmer (confirmer_address)
);

-- Campaign verification audit trail
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user_profile', 'user_document', 'campaign', 'milestone')),
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'under_review')),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    admin_id VARCHAR(255),
    admin_comments TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_verification_audit_entity (entity_type, entity_id),
    INDEX idx_verification_audit_admin (admin_id),
    INDEX idx_verification_audit_created_at (created_at)
);

-- System configuration for verification parameters
CREATE TABLE IF NOT EXISTS verification_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_verification_config_key (config_key)
);

-- Insert default verification configuration
INSERT INTO verification_config (config_key, config_value, description) VALUES
('required_documents', '{"BACKER": ["aadhar", "pan"], "PROJECT_CREATOR": ["aadhar", "pan", "address_proof"], "NGO_CREATOR": ["aadhar", "pan", "ngo_certificate", "address_proof"]}', 'Required documents for each user type'),
('verification_timeouts', '{"document_review": 48, "profile_review": 72}', 'Verification timeout hours'),
('oracle_parameters', '{"min_stake": "1000000000000000000", "min_reputation": 0.7, "consensus_threshold": 0.66}', 'Oracle network parameters'),
('zkp_parameters', '{"max_commitment_age": 2592000, "nullifier_window": 86400}', 'ZKP system parameters')
ON CONFLICT (config_key) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW verification_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN verification_status = 'under_review' THEN 1 END) as under_review_users,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_users,
    COUNT(CASE WHEN user_type = 'BACKER' THEN 1 END) as backer_count,
    COUNT(CASE WHEN user_type = 'PROJECT_CREATOR' THEN 1 END) as creator_count,
    COUNT(CASE WHEN user_type = 'NGO_CREATOR' THEN 1 END) as ngo_count
FROM user_profiles;

CREATE OR REPLACE VIEW pending_verifications AS
SELECT 
    up.id,
    up.email,
    up.name,
    up.user_type,
    up.verification_status,
    up.created_at,
    COUNT(ud.id) as document_count,
    COUNT(CASE WHEN ud.verification_status = 'approved' THEN 1 END) as approved_documents,
    COUNT(CASE WHEN ud.verification_status = 'pending' THEN 1 END) as pending_documents
FROM user_profiles up
LEFT JOIN user_documents ud ON up.id = ud.user_id
WHERE up.verification_status IN ('pending', 'under_review')
GROUP BY up.id, up.email, up.name, up.user_type, up.verification_status, up.created_at
ORDER BY up.created_at ASC;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_timestamp
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

CREATE TRIGGER trigger_update_user_additional_info_timestamp
    BEFORE UPDATE ON user_additional_info
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION log_verification_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO verification_audit_log (
        entity_type,
        entity_id,
        action,
        old_status,
        new_status,
        created_at
    ) VALUES (
        TG_TABLE_NAME::VARCHAR,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.verification_status END,
        CASE WHEN TG_OP != 'DELETE' THEN NEW.verification_status END,
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER trigger_audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_action();

CREATE TRIGGER trigger_audit_user_documents
    AFTER INSERT OR UPDATE OR DELETE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_action();