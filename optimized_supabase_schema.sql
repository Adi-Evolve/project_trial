-- ==========================================
-- OPTIMIZED SUPABASE DATABASE SCHEMA FOR PROJECTFORGE
-- ==========================================
-- Comprehensive and optimized schema removing duplicates and ensuring
-- proper table relationships, RLS policies, and data integrity
-- Execute these SQL statements in your Supabase SQL editor

-- Drop existing tables to avoid conflicts (optional - uncomment if needed)
-- DROP TABLE IF EXISTS public.security_alerts CASCADE;
-- DROP TABLE IF EXISTS public.zkp_commitments CASCADE;
-- DROP TABLE IF EXISTS public.ipfs_storage CASCADE;
-- DROP TABLE IF EXISTS public.blockchain_transactions CASCADE;
-- DROP TABLE IF EXISTS public.email_logs CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.votes CASCADE;
-- DROP TABLE IF EXISTS public.comments CASCADE;
-- DROP TABLE IF EXISTS public.chat_typing CASCADE;
-- DROP TABLE IF EXISTS public.chat_messages CASCADE;
-- DROP TABLE IF EXISTS public.chat_participants CASCADE;
-- DROP TABLE IF EXISTS public.chats CASCADE;
-- DROP TABLE IF EXISTS public.milestone_verifications CASCADE;
-- DROP TABLE IF EXISTS public.milestones CASCADE;
-- DROP TABLE IF EXISTS public.contributions CASCADE;
-- DROP TABLE IF EXISTS public.project_likes CASCADE;
-- DROP TABLE IF EXISTS public.follows CASCADE;
-- DROP TABLE IF EXISTS public.ideas CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================
-- 1. USERS TABLE (Enhanced with Document Verification)
-- ==========================================
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Authentication fields
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    verification_token TEXT UNIQUE,
    
    -- Profile fields
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    location VARCHAR(100),
    skills TEXT[],
    experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- KYC and verification fields
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'funder' CHECK (role IN ('funder', 'fund_raiser')),
    sub_role VARCHAR(20) CHECK (sub_role IN ('individual', 'ngo', 'company')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Document verification (IPFS hashes)
    aadhar_card_hash TEXT,
    pan_card_hash TEXT,
    ngo_certificate_hash TEXT,
    company_paper_hash TEXT,
    
    -- Verification status
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    reputation_score INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    total_contributions DECIMAL(20,6) DEFAULT 0,
    views INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    
    -- Privacy and preferences
    zkp_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. PROJECTS TABLE (Optimized with proper types)
-- ==========================================
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Basic project information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    
    -- Funding information
    funding_goal DECIMAL(20,6) NOT NULL,
    current_funding DECIMAL(20,6) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETH',
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Project status and blockchain
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'funded', 'completed', 'cancelled')),
    blockchain_campaign_id INTEGER,
    blockchain_tx_hash VARCHAR(66) UNIQUE,
    blockchain_network VARCHAR(50) DEFAULT 'polygon',
    creator_wallet_address VARCHAR(42),
    
    -- Media and documentation
    image_url TEXT,
    image_urls TEXT[], -- Multiple images
    video_url TEXT,
    website_url TEXT,
    github_url TEXT,
    whitepaper_url TEXT,
    ipfs_hash VARCHAR(100),
    
    -- Project structure
    roadmap JSONB DEFAULT '[]',
    team_members JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    
    -- Analytics and engagement
    featured BOOLEAN DEFAULT FALSE,
    total_backers INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- Verification and oracle
    milestone_check BOOLEAN DEFAULT FALSE,
    last_oracle_verification JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. IDEAS TABLE (For Community Ideas)
-- ==========================================
CREATE TABLE public.ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Basic idea information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    
    -- Financial estimates
    estimated_budget DECIMAL(20,6),
    currency VARCHAR(10) DEFAULT 'ETH',
    
    -- Idea status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'converted')),
    
    -- Detailed sections
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
    
    -- Engagement metrics
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Conversion and review
    converted_to_project_id UUID REFERENCES public.projects(id),
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    
    -- Blockchain and storage
    blockchain_tx_hash VARCHAR(66),
    ipfs_hash VARCHAR(100),
    image_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. PROJECT UPDATES TABLE (For Search and Communication)
-- ==========================================
CREATE TABLE public.project_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Update content
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    update_type VARCHAR(50) DEFAULT 'general' CHECK (update_type IN ('general', 'milestone', 'funding', 'team', 'technical')),
    
    -- Visibility and media
    is_public BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    video_url TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. CONTRIBUTIONS TABLE (Blockchain Funding)
-- ==========================================
CREATE TABLE public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Contribution details
    amount DECIMAL(20,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETH',
    contribution_message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    reward_tier VARCHAR(50),
    
    -- Blockchain transaction details
    blockchain_tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    gas_used INTEGER,
    gas_price DECIMAL(20,6),
    transaction_fee DECIMAL(20,6),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    
    -- Zero-knowledge proof support
    is_zkp BOOLEAN DEFAULT FALSE,
    zkp_proof TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. MILESTONES TABLE (Project Milestones)
-- ==========================================
CREATE TABLE public.milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Milestone details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    funding_amount DECIMAL(20,6) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Status and verification
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'rejected')),
    completion_proof TEXT,
    verification_count INTEGER DEFAULT 0,
    required_verifications INTEGER DEFAULT 3,
    
    -- Blockchain and storage
    blockchain_milestone_id INTEGER,
    ipfs_hash VARCHAR(100),
    funds_released BOOLEAN DEFAULT FALSE,
    release_tx_hash VARCHAR(66),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 7. MILESTONE VERIFICATIONS TABLE
-- ==========================================
CREATE TABLE public.milestone_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Verification details
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
    verification_proof TEXT,
    comments TEXT,
    blockchain_tx_hash VARCHAR(66),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. CHATS TABLE (Messaging System)
-- ==========================================
CREATE TABLE public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Chat configuration
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'project')),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    avatar TEXT,
    
    -- Associations
    project_id UUID REFERENCES public.projects(id),
    created_by UUID REFERENCES public.users(id) NOT NULL,
    
    -- Status and activity
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 9. CHAT PARTICIPANTS TABLE
-- ==========================================
CREATE TABLE public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Participation details
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    unread_count INTEGER DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(chat_id, user_id)
);

-- ==========================================
-- 10. CHAT MESSAGES TABLE
-- ==========================================
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'emoji', 'system')),
    
    -- File attachments
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    
    -- Message features
    reactions JSONB DEFAULT '{}',
    reply_to UUID REFERENCES public.chat_messages(id),
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 11. CHAT TYPING TABLE (Real-time typing indicators)
-- ==========================================
CREATE TABLE public.chat_typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 12. COMMENTS TABLE (Project and Idea Comments)
-- ==========================================
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Status flags
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure comment is for either project or idea, not both
    CHECK (
        (project_id IS NOT NULL AND idea_id IS NULL) OR 
        (project_id IS NULL AND idea_id IS NOT NULL)
    )
);

-- ==========================================
-- 13. VOTES TABLE (Ideas and Comments Voting)
-- ==========================================
CREATE TABLE public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- Vote details
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure vote is for either idea or comment, not both
    CHECK (
        (idea_id IS NOT NULL AND comment_id IS NULL) OR 
        (idea_id IS NULL AND comment_id IS NOT NULL)
    ),
    
    -- Unique constraints to prevent duplicate votes
    UNIQUE(user_id, idea_id),
    UNIQUE(user_id, comment_id)
);

-- ==========================================
-- 14. PROJECT LIKES TABLE
-- ==========================================
CREATE TABLE public.project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- ==========================================
-- 15. FOLLOWS TABLE (User Following)
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
-- 16. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Status and navigation
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 17. BLOCKCHAIN TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE public.blockchain_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Transaction identifiers
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    
    -- Transaction details
    value DECIMAL(30,18),
    gas_used INTEGER,
    gas_price DECIMAL(30,18),
    block_number BIGINT,
    block_hash VARCHAR(66),
    transaction_index INTEGER,
    
    -- Status and contract info
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    contract_address VARCHAR(42),
    
    -- Function and data
    function_name VARCHAR(100),
    function_params JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 18. IPFS STORAGE TABLE
-- ==========================================
CREATE TABLE public.ipfs_storage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- IPFS details
    ipfs_hash VARCHAR(100) UNIQUE NOT NULL,
    original_filename VARCHAR(500),
    file_size BIGINT,
    content_type VARCHAR(100),
    
    -- Ownership and associations
    uploaded_by UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    idea_id UUID REFERENCES public.ideas(id),
    milestone_id UUID REFERENCES public.milestones(id),
    
    -- File categorization
    file_category VARCHAR(50) CHECK (file_category IN ('image', 'video', 'document', 'whitepaper', 'proof', 'other')),
    
    -- Access control and metadata
    is_public BOOLEAN DEFAULT TRUE,
    access_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 19. ZKP COMMITMENTS TABLE (Zero-Knowledge Proofs)
-- ==========================================
CREATE TABLE public.zkp_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Commitment details
    commitment_hash VARCHAR(66) UNIQUE NOT NULL,
    nullifier_hash VARCHAR(66),
    merkle_root VARCHAR(66),
    
    -- Associated entities
    user_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    contribution_id UUID REFERENCES public.contributions(id),
    
    -- Proof details
    proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('identity', 'contribution', 'verification', 'voting')),
    proof_data JSONB NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    
    -- Blockchain reference
    blockchain_tx_hash VARCHAR(66),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 20. EMAIL LOGS TABLE (Email Tracking)
-- ==========================================
CREATE TABLE public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Email details
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(500) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    
    -- Blockchain and storage references
    blockchain_hash VARCHAR(66),
    ipfs_hash VARCHAR(100),
    
    -- Status and error handling
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'error')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 21. SECURITY ALERTS TABLE
-- ==========================================
CREATE TABLE public.security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Affected entities
    affected_entity_type VARCHAR(50),
    affected_entity_id UUID,
    user_id UUID REFERENCES public.users(id),
    
    -- Blockchain reference
    blockchain_tx_hash VARCHAR(66),
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    resolution_notes TEXT,
    
    -- Timestamps
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
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Projects indexes
CREATE INDEX idx_projects_creator ON public.projects(creator_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_funding_goal ON public.projects(funding_goal DESC);
CREATE INDEX idx_projects_current_funding ON public.projects(current_funding DESC);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_projects_view_count ON public.projects(view_count DESC);
CREATE INDEX idx_projects_like_count ON public.projects(like_count DESC);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_tags ON public.projects USING gin(tags);
CREATE INDEX idx_projects_title_search ON public.projects USING gin(to_tsvector('english', title));
CREATE INDEX idx_projects_description_search ON public.projects USING gin(to_tsvector('english', description));

-- Ideas indexes
CREATE INDEX idx_ideas_creator ON public.ideas(creator_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_ideas_category ON public.ideas(category);
CREATE INDEX idx_ideas_upvotes ON public.ideas(upvote_count DESC);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX idx_ideas_tags ON public.ideas USING gin(tags);
CREATE INDEX idx_ideas_title_search ON public.ideas USING gin(to_tsvector('english', title));

-- Project updates indexes
CREATE INDEX idx_project_updates_project ON public.project_updates(project_id);
CREATE INDEX idx_project_updates_author ON public.project_updates(author_id);
CREATE INDEX idx_project_updates_created_at ON public.project_updates(created_at DESC);
CREATE INDEX idx_project_updates_title_search ON public.project_updates USING gin(to_tsvector('english', title));
CREATE INDEX idx_project_updates_content_search ON public.project_updates USING gin(to_tsvector('english', content));

-- Contributions indexes
CREATE INDEX idx_contributions_project ON public.contributions(project_id);
CREATE INDEX idx_contributions_contributor ON public.contributions(contributor_id);
CREATE INDEX idx_contributions_tx_hash ON public.contributions(blockchain_tx_hash);
CREATE INDEX idx_contributions_status ON public.contributions(status);
CREATE INDEX idx_contributions_amount ON public.contributions(amount DESC);
CREATE INDEX idx_contributions_created_at ON public.contributions(created_at DESC);

-- Milestones indexes
CREATE INDEX idx_milestones_project ON public.milestones(project_id);
CREATE INDEX idx_milestones_status ON public.milestones(status);
CREATE INDEX idx_milestones_deadline ON public.milestones(deadline);

-- Chat indexes
CREATE INDEX idx_chats_created_by ON public.chats(created_by);
CREATE INDEX idx_chats_project ON public.chats(project_id);
CREATE INDEX idx_chats_type ON public.chats(type);
CREATE INDEX idx_chats_last_activity ON public.chats(last_activity DESC);

-- Chat participants indexes
CREATE INDEX idx_chat_participants_chat ON public.chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user ON public.chat_participants(user_id);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_chat ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Comments indexes
CREATE INDEX idx_comments_project ON public.comments(project_id);
CREATE INDEX idx_comments_idea ON public.comments(idea_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Votes indexes
CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_votes_idea ON public.votes(idea_id);
CREATE INDEX idx_votes_comment ON public.votes(comment_id);

-- Project likes indexes
CREATE INDEX idx_project_likes_user ON public.project_likes(user_id);
CREATE INDEX idx_project_likes_project ON public.project_likes(project_id);

-- Follows indexes
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Blockchain transactions indexes
CREATE INDEX idx_blockchain_tx_hash ON public.blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_from_address ON public.blockchain_transactions(from_address);
CREATE INDEX idx_blockchain_to_address ON public.blockchain_transactions(to_address);
CREATE INDEX idx_blockchain_status ON public.blockchain_transactions(status);
CREATE INDEX idx_blockchain_created_at ON public.blockchain_transactions(created_at DESC);

-- IPFS storage indexes
CREATE INDEX idx_ipfs_hash ON public.ipfs_storage(ipfs_hash);
CREATE INDEX idx_ipfs_uploaded_by ON public.ipfs_storage(uploaded_by);
CREATE INDEX idx_ipfs_project ON public.ipfs_storage(project_id);

-- ZKP commitments indexes
CREATE INDEX idx_zkp_commitment_hash ON public.zkp_commitments(commitment_hash);
CREATE INDEX idx_zkp_user ON public.zkp_commitments(user_id);
CREATE INDEX idx_zkp_project ON public.zkp_commitments(project_id);

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
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_updates_updated_at BEFORE UPDATE ON public.project_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update project funding stats
CREATE OR REPLACE FUNCTION update_project_funding_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
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
    FOR EACH ROW EXECUTE FUNCTION update_project_funding_stats();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update followers count for followed user
        UPDATE public.users 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        -- Update following count for follower
        UPDATE public.users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update followers count for followed user
        UPDATE public.users 
        SET followers_count = GREATEST(followers_count - 1, 0) 
        WHERE id = OLD.following_id;
        
        -- Update following count for follower
        UPDATE public.users 
        SET following_count = GREATEST(following_count - 1, 0) 
        WHERE id = OLD.follower_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for follower counts
CREATE TRIGGER update_follower_count_stats 
    AFTER INSERT OR DELETE ON public.follows 
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

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

-- Function to update project like counts
CREATE OR REPLACE FUNCTION update_project_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.projects 
        SET like_count = like_count + 1 
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.projects 
        SET like_count = GREATEST(like_count - 1, 0) 
        WHERE id = OLD.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for project likes
CREATE TRIGGER update_project_like_count_stats 
    AFTER INSERT OR DELETE ON public.project_likes 
    FOR EACH ROW EXECUTE FUNCTION update_project_like_counts();

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

-- Function to update chat last activity
CREATE OR REPLACE FUNCTION update_chat_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats 
    SET last_activity = NOW() 
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat activity
CREATE TRIGGER update_chat_last_activity 
    AFTER INSERT ON public.chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_chat_activity();

-- Function for project ownership verification
CREATE OR REPLACE FUNCTION is_project_owner(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_owner BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.projects 
        WHERE id = project_uuid AND creator_id = user_uuid
    ) INTO is_owner;
    
    RETURN is_owner;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_typing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipfs_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zkp_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- BASIC RLS POLICIES (Security First Approach)
-- ==========================================

-- Users table policies
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects table policies
CREATE POLICY "Anyone can view active projects" ON public.projects
    FOR SELECT USING (status IN ('active', 'funded', 'completed'));

CREATE POLICY "Project creators can manage own projects" ON public.projects
    FOR ALL USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

-- Ideas table policies
CREATE POLICY "Anyone can view approved ideas" ON public.ideas
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Idea creators can manage own ideas" ON public.ideas
    FOR ALL USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

-- Comments table policies
CREATE POLICY "Anyone can view public comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment authors can update own comments" ON public.comments
    FOR UPDATE USING (user_id = auth.uid());

-- Contributions table policies
CREATE POLICY "Contributors can view own contributions" ON public.contributions
    FOR SELECT USING (contributor_id = auth.uid());

CREATE POLICY "Authenticated users can contribute" ON public.contributions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- Chat system policies
CREATE POLICY "Participants can view chats" ON public.chats
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.chat_id = id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can view messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid()
        )
    );

-- ==========================================
-- SCHEMA COMPLETE
-- ==========================================
-- This optimized schema provides:
-- ✅ No duplicate tables or columns
-- ✅ Proper foreign key relationships 
-- ✅ Comprehensive indexing for performance
-- ✅ Automated triggers for data consistency
-- ✅ Basic RLS policies for security
-- ✅ Support for all discussed features:
--    - Project funding and milestones
--    - Chat and messaging system
--    - Ideas and community features
--    - Blockchain integration
--    - Document verification
--    - Zero-knowledge proofs
--    - IPFS storage
--    - Analytics and tracking
--
-- Next steps:
-- 1. Run this schema in Supabase
-- 2. Configure additional RLS policies as needed
-- 3. Set up storage buckets for file uploads
-- 4. Configure real-time subscriptions
-- 5. Add sample data for testing