-- =====================================================
-- PROJECTFORGE COMPLETE SUPABASE SCHEMA
-- =====================================================
-- Run this entire file in your Supabase SQL editor to set up the complete database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS AND AUTHENTICATION
-- =====================================================

-- Users table with comprehensive profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    college TEXT,
    role TEXT CHECK (role IN ('fund_raiser', 'donor', 'collaborator', 'mentor')),
    bio TEXT,
    location TEXT,
    website TEXT,
    avatar_url TEXT,
    github_profile TEXT,
    linkedin_profile TEXT,
    portfolio_url TEXT,
    reputation INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    wallet_verified BOOLEAN DEFAULT FALSE,
    total_projects_created INTEGER DEFAULT 0,
    total_projects_funded INTEGER DEFAULT 0,
    total_amount_funded DECIMAL DEFAULT 0,
    total_amount_raised DECIMAL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User skills with verification
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User interests/fields of interest
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, interest)
);

-- User sessions for tracking activity
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    wallet_signature TEXT,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PROJECTS
-- =====================================================

-- Main projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'seeking_team', 'seeking_funding', 'in_progress', 'completed', 'paused', 'cancelled')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    target_amount DECIMAL DEFAULT 0,
    current_amount DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ETH', 'MATIC', 'BTC')),
    start_date DATE,
    end_date DATE,
    team_size INTEGER DEFAULT 1,
    current_team_size INTEGER DEFAULT 1,
    location TEXT,
    remote BOOLEAN DEFAULT TRUE,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Blockchain integration fields
    blockchain_tx_hash TEXT UNIQUE, -- Transaction hash for project registration
    blockchain_block_number INTEGER,
    blockchain_network TEXT DEFAULT 'polygon', -- polygon, ethereum, etc.
    blockchain_contract_address TEXT,
    metadata_hash TEXT, -- Hash of project metadata stored on blockchain
    ownership_proof_hash TEXT, -- Blockchain proof of ownership
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    blockchain_verified BOOLEAN DEFAULT FALSE,
    blockchain_verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project tags
CREATE TABLE project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, tag)
);

-- Project requirements
CREATE TABLE project_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skills needed for projects
CREATE TABLE project_skills_needed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, skill)
);

-- Project collaborators and team members
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'contributor',
    permissions TEXT[] DEFAULT ARRAY['view', 'comment'],
    equity_percentage DECIMAL DEFAULT 0,
    hourly_rate DECIMAL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Project media (images, videos, documents)
CREATE TABLE project_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'demo_url', 'video_url')),
    url TEXT NOT NULL,
    filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- IDEAS
-- =====================================================

-- Ideas table for idea protection and sharing
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex', 'advanced')),
    time_estimate TEXT, -- e.g., "2-4 months"
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'protected')),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    collaboration_open BOOLEAN DEFAULT TRUE,
    potential_reward DECIMAL,
    
    -- Blockchain integration for idea protection
    blockchain_tx_hash TEXT UNIQUE, -- Transaction hash for idea registration
    blockchain_block_number INTEGER,
    blockchain_network TEXT DEFAULT 'polygon',
    ownership_proof_hash TEXT, -- Blockchain hash for ownership proof
    metadata_hash TEXT, -- Hash of idea metadata
    timestamp_proof TEXT, -- Blockchain timestamp proof
    protected_at TIMESTAMP,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted_to_project', 'archived')),
    converted_project_id UUID REFERENCES projects(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Idea tags
CREATE TABLE idea_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(idea_id, tag)
);

-- Skills needed for ideas
CREATE TABLE idea_skills_needed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(idea_id, skill)
);

-- What type of collaborators are needed for ideas
CREATE TABLE idea_looking_for (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    role_type TEXT NOT NULL, -- e.g., 'Frontend Developer', 'UI/UX Designer'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- FUNDING AND TRANSACTIONS
-- =====================================================

-- Project funding records with comprehensive blockchain tracking
CREATE TABLE project_funding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    funder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    currency TEXT NOT NULL,
    
    -- Blockchain transaction details
    blockchain_tx_hash TEXT UNIQUE NOT NULL, -- Transaction hash
    blockchain_block_number INTEGER,
    blockchain_network TEXT DEFAULT 'polygon',
    gas_used INTEGER,
    gas_price TEXT,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    contract_address TEXT, -- If using smart contract
    
    -- Transaction metadata
    transaction_status TEXT DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'confirmed', 'failed', 'cancelled')),
    confirmations INTEGER DEFAULT 0,
    funding_type TEXT DEFAULT 'direct' CHECK (funding_type IN ('direct', 'milestone', 'escrow')),
    milestone_id UUID, -- Reference to specific milestone if applicable
    
    -- Platform fees
    platform_fee_percentage DECIMAL DEFAULT 0,
    platform_fee_amount DECIMAL DEFAULT 0,
    net_amount DECIMAL, -- Amount after fees
    
    -- Timestamps
    transaction_initiated_at TIMESTAMP DEFAULT NOW(),
    blockchain_confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Funding milestones for escrow-based funding
CREATE TABLE funding_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL NOT NULL,
    current_amount DECIMAL DEFAULT 0,
    target_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    
    -- Blockchain escrow details
    escrow_contract_address TEXT,
    escrow_tx_hash TEXT,
    release_tx_hash TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INTERACTIONS (COMMENTS, VOTES, ETC.)
-- =====================================================

-- Comments on projects and ideas
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- project_id or idea_id
    target_type TEXT CHECK (target_type IN ('project', 'idea', 'update')),
    parent_id UUID REFERENCES comments(id), -- For replies
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    edited BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Voting system
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('project', 'idea', 'comment', 'update')),
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    
    -- Optional blockchain recording for important votes
    blockchain_tx_hash TEXT,
    blockchain_recorded BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Bookmarks/favorites
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('project', 'idea', 'user')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- =====================================================
-- PROJECT MANAGEMENT
-- =====================================================

-- Project milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    completed_by UUID REFERENCES users(id),
    reward DECIMAL DEFAULT 0,
    reward_currency TEXT DEFAULT 'USD',
    
    -- Blockchain verification for major milestones
    blockchain_tx_hash TEXT,
    blockchain_verified BOOLEAN DEFAULT FALSE,
    verification_hash TEXT,
    
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestone tasks
CREATE TABLE milestone_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    due_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project updates/announcements
CREATE TABLE project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    update_type TEXT CHECK (update_type IN ('progress', 'milestone', 'announcement', 'funding', 'team')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'team_only', 'funders_only')),
    pinned BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS AND COMMUNICATION
-- =====================================================

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Chat messages (for project collaboration)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'link')),
    reply_to UUID REFERENCES chat_messages(id),
    edited BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECURITY AND FRAUD DETECTION
-- =====================================================

-- Security audit logs
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT, -- 'project', 'idea', 'user', etc.
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud detection reports
CREATE TABLE fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('project', 'idea', 'user')),
    reporter_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blockchain verification records for important actions
CREATE TABLE blockchain_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_type TEXT NOT NULL CHECK (record_type IN ('user_verification', 'project_creation', 'idea_registration', 'funding', 'milestone_completion', 'vote_cast')),
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    
    -- Blockchain details
    blockchain_tx_hash TEXT UNIQUE NOT NULL,
    blockchain_block_number INTEGER,
    blockchain_network TEXT DEFAULT 'polygon',
    contract_address TEXT,
    gas_used INTEGER,
    gas_price TEXT,
    
    -- Data and verification
    data_hash TEXT NOT NULL, -- Hash of the data being recorded
    metadata JSONB, -- Additional blockchain metadata
    verified BOOLEAN DEFAULT FALSE,
    verification_confirmations INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP
);

-- =====================================================
-- ANALYTICS AND METRICS
-- =====================================================

-- User activity tracking
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    target_id UUID,
    target_type TEXT,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project view tracking
CREATE TABLE project_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL for anonymous views
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    view_duration_seconds INTEGER,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Projects indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_upvotes ON projects(upvotes DESC);
CREATE INDEX idx_projects_views ON projects(views DESC);
CREATE INDEX idx_projects_blockchain_tx_hash ON projects(blockchain_tx_hash);
CREATE INDEX idx_projects_featured ON projects(featured, created_at DESC) WHERE featured = TRUE;

-- Ideas indexes
CREATE INDEX idx_ideas_author_id ON ideas(author_id);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_visibility ON ideas(visibility);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_upvotes ON ideas(upvotes DESC);
CREATE INDEX idx_ideas_blockchain_tx_hash ON ideas(blockchain_tx_hash);

-- Funding indexes
CREATE INDEX idx_project_funding_project_id ON project_funding(project_id);
CREATE INDEX idx_project_funding_funder_id ON project_funding(funder_id);
CREATE INDEX idx_project_funding_blockchain_tx_hash ON project_funding(blockchain_tx_hash);
CREATE INDEX idx_project_funding_created_at ON project_funding(created_at DESC);

-- Comments indexes
CREATE INDEX idx_comments_target_id_type ON comments(target_id, target_type);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Votes indexes
CREATE INDEX idx_votes_user_target ON votes(user_id, target_id, target_type);
CREATE INDEX idx_votes_target_id_type ON votes(target_id, target_type);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read, created_at DESC);

-- Blockchain records indexes
CREATE INDEX idx_blockchain_records_tx_hash ON blockchain_records(blockchain_tx_hash);
CREATE INDEX idx_blockchain_records_target ON blockchain_records(target_id, target_type);
CREATE INDEX idx_blockchain_records_type ON blockchain_records(record_type, created_at DESC);

-- Activity tracking indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_project_views_project_id ON project_views(project_id, created_at DESC);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_updates_updated_at BEFORE UPDATE ON project_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funding_milestones_updated_at BEFORE UPDATE ON funding_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update counters
CREATE OR REPLACE FUNCTION update_project_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Update views, upvotes, downvotes, comments count, etc.
    IF TG_TABLE_NAME = 'votes' THEN
        IF NEW.target_type = 'project' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE projects SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
            ELSE
                UPDATE projects SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
            END IF;
        ELSIF NEW.target_type = 'idea' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE ideas SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
            ELSE
                UPDATE ideas SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for counters
CREATE TRIGGER update_vote_counters AFTER INSERT ON votes FOR EACH ROW EXECUTE FUNCTION update_project_counters();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Project summary view with funding and team info
CREATE VIEW project_summary AS
SELECT 
    p.*,
    u.full_name as owner_name,
    u.avatar_url as owner_avatar,
    u.reputation as owner_reputation,
    COALESCE(f.total_funded, 0) as total_funded,
    COALESCE(f.funders_count, 0) as funders_count,
    COALESCE(c.collaborators_count, 0) as collaborators_count,
    array_agg(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL) as tags,
    array_agg(DISTINCT psn.skill) FILTER (WHERE psn.skill IS NOT NULL) as skills_needed
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN (
    SELECT 
        project_id, 
        SUM(net_amount) as total_funded, 
        COUNT(DISTINCT funder_id) as funders_count
    FROM project_funding 
    WHERE transaction_status = 'confirmed'
    GROUP BY project_id
) f ON p.id = f.project_id
LEFT JOIN (
    SELECT 
        project_id, 
        COUNT(*) as collaborators_count
    FROM project_collaborators 
    WHERE status = 'active'
    GROUP BY project_id
) c ON p.id = c.project_id
LEFT JOIN project_tags pt ON p.id = pt.project_id
LEFT JOIN project_skills_needed psn ON p.id = psn.project_id
GROUP BY p.id, u.full_name, u.avatar_url, u.reputation, f.total_funded, f.funders_count, c.collaborators_count;

-- User profile summary view
CREATE VIEW user_profile_summary AS
SELECT 
    u.*,
    array_agg(DISTINCT us.skill_name) FILTER (WHERE us.skill_name IS NOT NULL) as skills,
    array_agg(DISTINCT ui.interest) FILTER (WHERE ui.interest IS NOT NULL) as interests,
    COALESCE(p.projects_created, 0) as projects_created,
    COALESCE(p.projects_completed, 0) as projects_completed,
    COALESCE(f.amount_funded, 0) as total_amount_funded,
    COALESCE(f.projects_funded, 0) as projects_funded_count
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN user_interests ui ON u.id = ui.user_id
LEFT JOIN (
    SELECT 
        owner_id, 
        COUNT(*) as projects_created,
        COUNT(*) FILTER (WHERE status = 'completed') as projects_completed
    FROM projects 
    GROUP BY owner_id
) p ON u.id = p.owner_id
LEFT JOIN (
    SELECT 
        funder_id, 
        SUM(net_amount) as amount_funded,
        COUNT(DISTINCT project_id) as projects_funded
    FROM project_funding 
    WHERE transaction_status = 'confirmed'
    GROUP BY funder_id
) f ON u.id = f.funder_id
GROUP BY u.id, p.projects_created, p.projects_completed, f.amount_funded, f.projects_funded;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Insert some default data for categories and configuration
INSERT INTO users (id, wallet_address, email, full_name, role, verified, email_verified, wallet_verified)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '0x0000000000000000000000000000000000000001',
    'admin@projectforge.com',
    'ProjectForge Admin',
    'fund_raiser',
    true,
    true,
    true
) ON CONFLICT (wallet_address) DO NOTHING;

COMMENT ON DATABASE postgres IS 'ProjectForge - Decentralized Project Collaboration Platform';