-- ==========================================
-- SUPABASE DATABASE SETUP FOR PROJECTFORGE
-- ==========================================
-- Complete database schema for ProjectForge platform
-- Execute these SQL statements in your Supabase SQL editor

-- ==========================================
-- 1. USERS TABLE (Enhanced with Document Verification)
-- ==========================================
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    location VARCHAR(100),
    skills TEXT[], -- Array of skills
    experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    reputation_score INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    total_contributions DECIMAL(20,6) DEFAULT 0,
    
    -- Enhanced user fields from BS
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'funder' CHECK (role IN ('funder', 'fund_raiser')),
    sub_role VARCHAR(20) CHECK (sub_role IN ('individual', 'ngo', 'company')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Document verification fields
    aadhar_card_hash TEXT, -- IPFS hash of Aadhar card
    pan_card_hash TEXT, -- IPFS hash of PAN card  
    ngo_certificate_hash TEXT, -- IPFS hash of NGO certificate (if applicable)
    company_paper_hash TEXT, -- IPFS hash of company registration (if applicable)
    verification_token TEXT UNIQUE, -- For email verification
    
    -- Verification status
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- Document verification status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Additional fields
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. PROJECTS TABLE
-- ==========================================
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    funding_goal DECIMAL(20,6) NOT NULL,
    current_funding DECIMAL(20,6) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETH',
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'funded', 'completed', 'cancelled')),
    blockchain_campaign_id INTEGER,
    blockchain_tx_hash VARCHAR(66),
    ipfs_hash VARCHAR(100),
    image_url TEXT,
    video_url TEXT,
    website_url TEXT,
    github_url TEXT,
    whitepaper_url TEXT,
    roadmap JSONB DEFAULT '[]',
    team_members JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT FALSE,
    total_backers INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. IDEAS TABLE
-- ==========================================
CREATE TABLE public.ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    estimated_budget DECIMAL(20,6),
    currency VARCHAR(10) DEFAULT 'ETH',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'converted')),
    blockchain_tx_hash VARCHAR(66),
    ipfs_hash VARCHAR(100),
    image_url TEXT,
    target_audience VARCHAR(200),
    problem_statement TEXT,
    proposed_solution TEXT,
    expected_impact TEXT,
    technical_requirements TEXT,
    market_analysis TEXT,
    competition_analysis TEXT,
    monetization_strategy TEXT,
    risk_assessment TEXT,
    success_metrics TEXT,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    converted_to_project_id UUID REFERENCES public.projects(id),
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. CONTRIBUTIONS TABLE
-- ==========================================
CREATE TABLE public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(20,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETH',
    blockchain_tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    gas_used INTEGER,
    gas_price DECIMAL(20,6),
    transaction_fee DECIMAL(20,6),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    contribution_message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    reward_tier VARCHAR(50),
    zkp_proof TEXT, -- Zero-knowledge proof for private contributions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 5. MILESTONES TABLE
-- ==========================================
CREATE TABLE public.milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    funding_amount DECIMAL(20,6) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'rejected')),
    blockchain_milestone_id INTEGER,
    completion_proof TEXT,
    ipfs_hash VARCHAR(100),
    verification_count INTEGER DEFAULT 0,
    required_verifications INTEGER DEFAULT 3,
    funds_released BOOLEAN DEFAULT FALSE,
    release_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 6. MILESTONE VERIFICATIONS TABLE
-- ==========================================
CREATE TABLE public.milestone_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
    verification_proof TEXT,
    comments TEXT,
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(milestone_id, verifier_id)
);

-- ==========================================
-- 7. COMMENTS TABLE
-- ==========================================
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (project_id IS NOT NULL AND idea_id IS NULL) OR 
        (project_id IS NULL AND idea_id IS NOT NULL)
    )
);

-- ==========================================
-- 8. VOTES TABLE (for ideas and comments)
-- ==========================================
CREATE TABLE public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (idea_id IS NOT NULL AND comment_id IS NULL) OR 
        (idea_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, idea_id),
    UNIQUE(user_id, comment_id)
);

-- ==========================================
-- 9. PROJECT LIKES TABLE
-- ==========================================
CREATE TABLE public.project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- ==========================================
-- 10. FOLLOWS TABLE
-- ==========================================
CREATE TABLE public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ==========================================
-- 11. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 12. EMAIL LOGS TABLE (for enhanced EmailJS)
-- ==========================================
CREATE TABLE public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(500) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    blockchain_hash VARCHAR(66),
    ipfs_hash VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'error')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 13. BLOCKCHAIN TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE public.blockchain_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value DECIMAL(30,18),
    gas_used INTEGER,
    gas_price DECIMAL(30,18),
    block_number BIGINT,
    block_hash VARCHAR(66),
    transaction_index INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    contract_address VARCHAR(42),
    logs JSONB DEFAULT '[]',
    function_name VARCHAR(100),
    function_params JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 14. IPFS STORAGE TABLE
-- ==========================================
CREATE TABLE public.ipfs_storage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ipfs_hash VARCHAR(100) UNIQUE NOT NULL,
    original_filename VARCHAR(500),
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    idea_id UUID REFERENCES public.ideas(id),
    milestone_id UUID REFERENCES public.milestones(id),
    file_category VARCHAR(50) CHECK (file_category IN ('image', 'video', 'document', 'whitepaper', 'proof', 'other')),
    metadata JSONB DEFAULT '{}',
    access_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 15. ZKP COMMITMENTS TABLE
-- ==========================================
CREATE TABLE public.zkp_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commitment_hash VARCHAR(66) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    contribution_id UUID REFERENCES public.contributions(id),
    proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('identity', 'contribution', 'verification', 'voting')),
    nullifier_hash VARCHAR(66),
    merkle_root VARCHAR(66),
    proof_data JSONB NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 16. SECURITY ALERTS TABLE
-- ==========================================
CREATE TABLE public.security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_entity_type VARCHAR(50),
    affected_entity_id UUID,
    blockchain_tx_hash VARCHAR(66),
    user_id UUID REFERENCES public.users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Users indexes
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_reputation ON public.users(reputation_score DESC);

-- Projects indexes
CREATE INDEX idx_projects_creator ON public.projects(creator_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_funding_goal ON public.projects(funding_goal DESC);
CREATE INDEX idx_projects_current_funding ON public.projects(current_funding DESC);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_projects_blockchain_campaign ON public.projects(blockchain_campaign_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- Ideas indexes
CREATE INDEX idx_ideas_creator ON public.ideas(creator_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_ideas_category ON public.ideas(category);
CREATE INDEX idx_ideas_upvotes ON public.ideas(upvote_count DESC);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at DESC);

-- Contributions indexes
CREATE INDEX idx_contributions_project ON public.contributions(project_id);
CREATE INDEX idx_contributions_contributor ON public.contributions(contributor_id);
CREATE INDEX idx_contributions_tx_hash ON public.contributions(blockchain_tx_hash);
CREATE INDEX idx_contributions_status ON public.contributions(status);
CREATE INDEX idx_contributions_amount ON public.contributions(amount DESC);

-- Milestones indexes
CREATE INDEX idx_milestones_project ON public.milestones(project_id);
CREATE INDEX idx_milestones_status ON public.milestones(status);
CREATE INDEX idx_milestones_deadline ON public.milestones(deadline);

-- Comments indexes
CREATE INDEX idx_comments_project ON public.comments(project_id);
CREATE INDEX idx_comments_idea ON public.comments(idea_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Blockchain transactions indexes
CREATE INDEX idx_blockchain_tx_hash ON public.blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_from_address ON public.blockchain_transactions(from_address);
CREATE INDEX idx_blockchain_to_address ON public.blockchain_transactions(to_address);
CREATE INDEX idx_blockchain_status ON public.blockchain_transactions(status);
CREATE INDEX idx_blockchain_created_at ON public.blockchain_transactions(created_at DESC);

-- Email logs indexes
CREATE INDEX idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- IPFS storage indexes
CREATE INDEX idx_ipfs_hash ON public.ipfs_storage(ipfs_hash);
CREATE INDEX idx_ipfs_uploaded_by ON public.ipfs_storage(uploaded_by);
CREATE INDEX idx_ipfs_project ON public.ipfs_storage(project_id);
CREATE INDEX idx_ipfs_category ON public.ipfs_storage(file_category);

-- ZKP commitments indexes
CREATE INDEX idx_zkp_commitment_hash ON public.zkp_commitments(commitment_hash);
CREATE INDEX idx_zkp_user ON public.zkp_commitments(user_id);
CREATE INDEX idx_zkp_project ON public.zkp_commitments(project_id);
CREATE INDEX idx_zkp_proof_type ON public.zkp_commitments(proof_type);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update project stats
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update funding and backer count
        UPDATE public.projects 
        SET 
            current_funding = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM public.contributions 
                WHERE project_id = NEW.project_id AND status = 'confirmed'
            ),
            total_backers = (
                SELECT COUNT(DISTINCT contributor_id) 
                FROM public.contributions 
                WHERE project_id = NEW.project_id AND status = 'confirmed'
            )
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update funding and backer count
        UPDATE public.projects 
        SET 
            current_funding = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM public.contributions 
                WHERE project_id = NEW.project_id AND status = 'confirmed'
            ),
            total_backers = (
                SELECT COUNT(DISTINCT contributor_id) 
                FROM public.contributions 
                WHERE project_id = NEW.project_id AND status = 'confirmed'
            )
        WHERE id = NEW.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for contribution stats
CREATE TRIGGER update_project_contribution_stats 
    AFTER INSERT OR UPDATE ON public.contributions 
    FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.project_id IS NOT NULL THEN
            UPDATE public.projects 
            SET comment_count = comment_count + 1 
            WHERE id = NEW.project_id;
        END IF;
        
        IF NEW.idea_id IS NOT NULL THEN
            UPDATE public.ideas 
            SET comment_count = comment_count + 1 
            WHERE id = NEW.idea_id;
        END IF;
        
        IF NEW.parent_comment_id IS NOT NULL THEN
            UPDATE public.comments 
            SET reply_count = reply_count + 1 
            WHERE id = NEW.parent_comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.project_id IS NOT NULL THEN
            UPDATE public.projects 
            SET comment_count = GREATEST(comment_count - 1, 0) 
            WHERE id = OLD.project_id;
        END IF;
        
        IF OLD.idea_id IS NOT NULL THEN
            UPDATE public.ideas 
            SET comment_count = GREATEST(comment_count - 1, 0) 
            WHERE id = OLD.idea_id;
        END IF;
        
        IF OLD.parent_comment_id IS NOT NULL THEN
            UPDATE public.comments 
            SET reply_count = GREATEST(reply_count - 1, 0) 
            WHERE id = OLD.parent_comment_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for comment counts
CREATE TRIGGER update_comment_count_stats 
    AFTER INSERT OR DELETE ON public.comments 
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.idea_id IS NOT NULL THEN
            IF NEW.vote_type = 'upvote' THEN
                UPDATE public.ideas SET upvote_count = upvote_count + 1 WHERE id = NEW.idea_id;
            ELSE
                UPDATE public.ideas SET downvote_count = downvote_count + 1 WHERE id = NEW.idea_id;
            END IF;
        END IF;
        
        IF NEW.comment_id IS NOT NULL THEN
            IF NEW.vote_type = 'upvote' THEN
                UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.idea_id IS NOT NULL THEN
            IF OLD.vote_type = 'upvote' THEN
                UPDATE public.ideas SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.idea_id;
            ELSE
                UPDATE public.ideas SET downvote_count = GREATEST(downvote_count - 1, 0) WHERE id = OLD.idea_id;
            END IF;
        END IF;
        
        IF OLD.comment_id IS NOT NULL THEN
            IF OLD.vote_type = 'upvote' THEN
                UPDATE public.comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.idea_id IS NOT NULL THEN
            -- Remove old vote
            IF OLD.vote_type = 'upvote' THEN
                UPDATE public.ideas SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = NEW.idea_id;
            ELSE
                UPDATE public.ideas SET downvote_count = GREATEST(downvote_count - 1, 0) WHERE id = NEW.idea_id;
            END IF;
            
            -- Add new vote
            IF NEW.vote_type = 'upvote' THEN
                UPDATE public.ideas SET upvote_count = upvote_count + 1 WHERE id = NEW.idea_id;
            ELSE
                UPDATE public.ideas SET downvote_count = downvote_count + 1 WHERE id = NEW.idea_id;
            END IF;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for vote counts
CREATE TRIGGER update_vote_count_stats 
    AFTER INSERT OR UPDATE OR DELETE ON public.votes 
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to update like counts for projects
CREATE OR REPLACE FUNCTION update_project_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.projects SET like_count = like_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.projects SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for project likes
CREATE TRIGGER update_project_like_count_stats 
    AFTER INSERT OR DELETE ON public.project_likes 
    FOR EACH ROW EXECUTE FUNCTION update_project_like_counts();