-- ==========================================
-- SUPABASE RLS (Row Level Security) POLICIES
-- ==========================================
-- Security policies for ProjectForge platform
-- Execute AFTER running the database schema

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipfs_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zkp_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can read all public user profiles
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Users cannot delete profiles (only deactivate)
CREATE POLICY "Users cannot delete profiles" ON public.users
    FOR DELETE USING (false);

-- ==========================================
-- PROJECTS TABLE POLICIES
-- ==========================================

-- Everyone can read active projects
CREATE POLICY "Anyone can view active projects" ON public.projects
    FOR SELECT USING (
        status IN ('active', 'funded', 'completed') OR 
        creator_id::text = auth.uid()::text
    );

-- Users can create projects
CREATE POLICY "Authenticated users can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        creator_id::text = auth.uid()::text
    );

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (creator_id::text = auth.uid()::text);

-- Users can delete their own draft projects
CREATE POLICY "Users can delete own draft projects" ON public.projects
    FOR DELETE USING (
        creator_id::text = auth.uid()::text AND 
        status = 'draft'
    );

-- ==========================================
-- IDEAS TABLE POLICIES
-- ==========================================

-- Everyone can read approved ideas
CREATE POLICY "Anyone can view approved ideas" ON public.ideas
    FOR SELECT USING (
        status = 'approved' OR 
        creator_id::text = auth.uid()::text
    );

-- Authenticated users can create ideas
CREATE POLICY "Authenticated users can create ideas" ON public.ideas
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        creator_id::text = auth.uid()::text
    );

-- Users can update their own ideas (if not yet approved)
CREATE POLICY "Users can update own pending ideas" ON public.ideas
    FOR UPDATE USING (
        creator_id::text = auth.uid()::text AND 
        status IN ('draft', 'pending')
    );

-- Users can delete their own draft ideas
CREATE POLICY "Users can delete own draft ideas" ON public.ideas
    FOR DELETE USING (
        creator_id::text = auth.uid()::text AND 
        status = 'draft'
    );

-- ==========================================
-- CONTRIBUTIONS TABLE POLICIES
-- ==========================================

-- Users can view contributions to their projects
CREATE POLICY "Project creators can view contributions" ON public.contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND creator_id::text = auth.uid()::text
        )
    );

-- Users can view their own contributions
CREATE POLICY "Users can view own contributions" ON public.contributions
    FOR SELECT USING (contributor_id::text = auth.uid()::text);

-- Authenticated users can create contributions
CREATE POLICY "Authenticated users can contribute" ON public.contributions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        contributor_id::text = auth.uid()::text
    );

-- No updates or deletes allowed on contributions (immutable)
CREATE POLICY "Contributions are immutable" ON public.contributions
    FOR UPDATE USING (false);

CREATE POLICY "Contributions cannot be deleted" ON public.contributions
    FOR DELETE USING (false);

-- ==========================================
-- MILESTONES TABLE POLICIES
-- ==========================================

-- Everyone can read milestones of active projects
CREATE POLICY "Anyone can view project milestones" ON public.milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND status IN ('active', 'funded', 'completed')
        ) OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND creator_id::text = auth.uid()::text
        )
    );

-- Project creators can create milestones
CREATE POLICY "Project creators can create milestones" ON public.milestones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND creator_id::text = auth.uid()::text
        )
    );

-- Project creators can update their milestones
CREATE POLICY "Project creators can update milestones" ON public.milestones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND creator_id::text = auth.uid()::text
        )
    );

-- ==========================================
-- MILESTONE VERIFICATIONS TABLE POLICIES
-- ==========================================

-- Anyone can read milestone verifications
CREATE POLICY "Anyone can view milestone verifications" ON public.milestone_verifications
    FOR SELECT USING (true);

-- Authenticated users can create verifications
CREATE POLICY "Authenticated users can verify milestones" ON public.milestone_verifications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        verifier_id::text = auth.uid()::text
    );

-- Users can update their own verifications (within time limit)
CREATE POLICY "Users can update own verifications" ON public.milestone_verifications
    FOR UPDATE USING (
        verifier_id::text = auth.uid()::text AND 
        created_at > NOW() - INTERVAL '24 hours'
    );

-- ==========================================
-- COMMENTS TABLE POLICIES
-- ==========================================

-- Everyone can read comments on public projects/ideas
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (
        (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND status IN ('active', 'funded', 'completed')
        )) OR
        (idea_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE id = idea_id AND status = 'approved'
        )) OR
        user_id::text = auth.uid()::text
    );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can comment" ON public.comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- ==========================================
-- VOTES TABLE POLICIES
-- ==========================================

-- Users can view votes on public content
CREATE POLICY "Anyone can view votes" ON public.votes
    FOR SELECT USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON public.votes
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON public.votes
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON public.votes
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- ==========================================
-- PROJECT LIKES TABLE POLICIES
-- ==========================================

-- Anyone can view project likes (count)
CREATE POLICY "Anyone can view project likes" ON public.project_likes
    FOR SELECT USING (true);

-- Authenticated users can like projects
CREATE POLICY "Authenticated users can like projects" ON public.project_likes
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

-- Users can unlike projects
CREATE POLICY "Users can unlike projects" ON public.project_likes
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- ==========================================
-- FOLLOWS TABLE POLICIES
-- ==========================================

-- Users can view who follows whom
CREATE POLICY "Anyone can view follows" ON public.follows
    FOR SELECT USING (true);

-- Authenticated users can follow others
CREATE POLICY "Authenticated users can follow" ON public.follows
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        follower_id::text = auth.uid()::text
    );

-- Users can unfollow
CREATE POLICY "Users can unfollow" ON public.follows
    FOR DELETE USING (follower_id::text = auth.uid()::text);

-- ==========================================
-- NOTIFICATIONS TABLE POLICIES
-- ==========================================

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- System can create notifications
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- ==========================================
-- EMAIL LOGS TABLE POLICIES
-- ==========================================

-- Only authenticated users can view email logs (limited)
CREATE POLICY "Limited access to email logs" ON public.email_logs
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        recipient_email IN (
            SELECT email FROM public.users WHERE id::text = auth.uid()::text
        )
    );

-- System can create email logs
CREATE POLICY "System can create email logs" ON public.email_logs
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- BLOCKCHAIN TRANSACTIONS TABLE POLICIES
-- ==========================================

-- Anyone can view confirmed blockchain transactions
CREATE POLICY "Anyone can view confirmed transactions" ON public.blockchain_transactions
    FOR SELECT USING (status = 'confirmed');

-- System can create blockchain transaction records
CREATE POLICY "System can create blockchain transactions" ON public.blockchain_transactions
    FOR INSERT WITH CHECK (true);

-- System can update transaction status
CREATE POLICY "System can update transaction status" ON public.blockchain_transactions
    FOR UPDATE USING (true);

-- ==========================================
-- IPFS STORAGE TABLE POLICIES
-- ==========================================

-- Anyone can view public IPFS files
CREATE POLICY "Anyone can view public IPFS files" ON public.ipfs_storage
    FOR SELECT USING (is_public = true);

-- Users can view their own IPFS files
CREATE POLICY "Users can view own IPFS files" ON public.ipfs_storage
    FOR SELECT USING (uploaded_by::text = auth.uid()::text);

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files" ON public.ipfs_storage
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        uploaded_by::text = auth.uid()::text
    );

-- Users can update their own file metadata
CREATE POLICY "Users can update own file metadata" ON public.ipfs_storage
    FOR UPDATE USING (uploaded_by::text = auth.uid()::text);

-- ==========================================
-- ZKP COMMITMENTS TABLE POLICIES
-- ==========================================

-- Users can view their own ZKP commitments
CREATE POLICY "Users can view own ZKP commitments" ON public.zkp_commitments
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Anyone can view public ZKP proofs (for verification)
CREATE POLICY "Anyone can verify ZKP proofs" ON public.zkp_commitments
    FOR SELECT USING (proof_type IN ('verification', 'voting'));

-- Authenticated users can create ZKP commitments
CREATE POLICY "Authenticated users can create ZKP commitments" ON public.zkp_commitments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

-- ==========================================
-- SECURITY ALERTS TABLE POLICIES
-- ==========================================

-- Users can view security alerts related to their content
CREATE POLICY "Users can view relevant security alerts" ON public.security_alerts
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR
        severity IN ('high', 'critical')
    );

-- System can create security alerts
CREATE POLICY "System can create security alerts" ON public.security_alerts
    FOR INSERT WITH CHECK (true);

-- System can update security alerts
CREATE POLICY "System can update security alerts" ON public.security_alerts
    FOR UPDATE USING (true);

-- ==========================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ==========================================

-- Function to check if user is project creator
CREATE OR REPLACE FUNCTION auth.is_project_creator(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_uuid AND creator_id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is idea creator
CREATE OR REPLACE FUNCTION auth.is_idea_creator(idea_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.ideas 
        WHERE id = idea_uuid AND creator_id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has contributed to project
CREATE OR REPLACE FUNCTION auth.has_contributed_to_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.contributions 
        WHERE project_id = project_uuid 
        AND contributor_id::text = auth.uid()::text 
        AND status = 'confirmed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;