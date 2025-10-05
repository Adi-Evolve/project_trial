-- ==========================================
-- ROW LEVEL SECURITY POLICIES FOR PROJECTFORGE
-- ==========================================
-- Comprehensive RLS policies for all tables
-- Execute after running the main schema file

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can view all public user profiles
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Only authenticated users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- ==========================================
-- PROJECTS TABLE POLICIES
-- ==========================================

-- Anyone can view active/completed projects
CREATE POLICY "Anyone can view public projects" ON public.projects
    FOR SELECT USING (
        status IN ('active', 'funded', 'completed') OR 
        creator_id = auth.uid()
    );

-- Only authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        creator_id = auth.uid()
    );

-- Project creators can update their own projects
CREATE POLICY "Creators can update own projects" ON public.projects
    FOR UPDATE USING (creator_id = auth.uid());

-- Project creators can delete their own projects
CREATE POLICY "Creators can delete own projects" ON public.projects
    FOR DELETE USING (creator_id = auth.uid());

-- ==========================================
-- IDEAS TABLE POLICIES
-- ==========================================

-- Anyone can view approved ideas
CREATE POLICY "Anyone can view approved ideas" ON public.ideas
    FOR SELECT USING (
        status = 'approved' OR 
        creator_id = auth.uid()
    );

-- Authenticated users can create ideas
CREATE POLICY "Authenticated users can create ideas" ON public.ideas
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        creator_id = auth.uid()
    );

-- Idea creators can update their own ideas
CREATE POLICY "Creators can update own ideas" ON public.ideas
    FOR UPDATE USING (creator_id = auth.uid());

-- Idea creators can delete their own ideas
CREATE POLICY "Creators can delete own ideas" ON public.ideas
    FOR DELETE USING (creator_id = auth.uid());

-- ==========================================
-- PROJECT UPDATES TABLE POLICIES
-- ==========================================

-- Anyone can view public project updates
CREATE POLICY "Anyone can view public project updates" ON public.project_updates
    FOR SELECT USING (is_public = true);

-- Project owners and collaborators can view all updates
CREATE POLICY "Project team can view all updates" ON public.project_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_collaborators pc 
            WHERE pc.project_id = project_updates.project_id 
            AND pc.user_id = auth.uid() 
            AND pc.status = 'accepted'
        )
    );

-- Project team can create updates
CREATE POLICY "Project team can create updates" ON public.project_updates
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        author_id = auth.uid() AND
        (EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_collaborators pc 
            WHERE pc.project_id = project_updates.project_id 
            AND pc.user_id = auth.uid() 
            AND pc.status = 'accepted'
        ))
    );

-- Authors can update their own updates
CREATE POLICY "Authors can update own updates" ON public.project_updates
    FOR UPDATE USING (author_id = auth.uid());

-- Authors can delete their own updates
CREATE POLICY "Authors can delete own updates" ON public.project_updates
    FOR DELETE USING (author_id = auth.uid());

-- ==========================================
-- COMMUNITY CHALLENGES TABLE POLICIES
-- ==========================================

-- Anyone can view active challenges
CREATE POLICY "Anyone can view active challenges" ON public.community_challenges
    FOR SELECT USING (
        status = 'active' OR 
        created_by = auth.uid()
    );

-- Authenticated users can create challenges
CREATE POLICY "Authenticated users can create challenges" ON public.community_challenges
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    );

-- Challenge creators can update their challenges
CREATE POLICY "Creators can update own challenges" ON public.community_challenges
    FOR UPDATE USING (created_by = auth.uid());

-- ==========================================
-- CONTRIBUTIONS TABLE POLICIES
-- ==========================================

-- Contributors and project owners can view contributions
CREATE POLICY "Contributors and owners can view contributions" ON public.contributions
    FOR SELECT USING (
        contributor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        ) OR
        is_anonymous = false
    );

-- Authenticated users can create contributions
CREATE POLICY "Authenticated users can contribute" ON public.contributions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        contributor_id = auth.uid()
    );

-- Contributors can update their own contributions
CREATE POLICY "Contributors can update own contributions" ON public.contributions
    FOR UPDATE USING (contributor_id = auth.uid());

-- ==========================================
-- ESCROW TABLES POLICIES
-- ==========================================

-- Escrow milestones - project team and contributors can view
CREATE POLICY "Project stakeholders can view milestones" ON public.escrow_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.contributions c 
            WHERE c.project_id = escrow_milestones.project_id AND c.contributor_id = auth.uid()
        )
    );

-- Project owners can manage milestones
CREATE POLICY "Project owners can manage milestones" ON public.escrow_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

-- Escrow releases - similar policies
CREATE POLICY "Project stakeholders can view releases" ON public.escrow_releases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.contributions c 
            WHERE c.project_id = escrow_releases.project_id AND c.contributor_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage releases" ON public.escrow_releases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

-- ==========================================
-- CHAT SYSTEM POLICIES
-- ==========================================

-- Chat participants can view chats they're part of
CREATE POLICY "Participants can view their chats" ON public.chats
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.chat_id = id AND cp.user_id = auth.uid()
        )
    );

-- Authenticated users can create chats
CREATE POLICY "Authenticated users can create chats" ON public.chats
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    );

-- Chat creators can update their chats
CREATE POLICY "Chat creators can update chats" ON public.chats
    FOR UPDATE USING (created_by = auth.uid());

-- Chat participants table
CREATE POLICY "Participants can view chat members" ON public.chat_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_participants cp2 
            WHERE cp2.chat_id = chat_id AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Chat owners can manage participants" ON public.chat_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.chats c 
            WHERE c.id = chat_id AND c.created_by = auth.uid()
        )
    );

-- Chat messages
CREATE POLICY "Participants can view chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Senders can update their messages" ON public.chat_messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Senders can delete their messages" ON public.chat_messages
    FOR DELETE USING (sender_id = auth.uid());

-- ==========================================
-- COMMENTS TABLE POLICIES
-- ==========================================

-- Anyone can view comments on public projects/ideas
CREATE POLICY "Anyone can view public comments" ON public.comments
    FOR SELECT USING (
        (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.status IN ('active', 'funded', 'completed')
        )) OR
        (idea_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.ideas i 
            WHERE i.id = idea_id AND i.status = 'approved'
        ))
    );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can comment" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Comment authors can update their comments
CREATE POLICY "Authors can update own comments" ON public.comments
    FOR UPDATE USING (user_id = auth.uid());

-- Comment authors can delete their comments
CREATE POLICY "Authors can delete own comments" ON public.comments
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- VOTES TABLE POLICIES
-- ==========================================

-- Users can view all votes (for transparency)
CREATE POLICY "Users can view votes" ON public.votes
    FOR SELECT USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON public.votes
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON public.votes
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON public.votes
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- PROJECT LIKES TABLE POLICIES
-- ==========================================

-- Users can view all likes
CREATE POLICY "Users can view project likes" ON public.project_likes
    FOR SELECT USING (true);

-- Authenticated users can like projects
CREATE POLICY "Authenticated users can like projects" ON public.project_likes
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Users can unlike their own likes
CREATE POLICY "Users can unlike projects" ON public.project_likes
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- FOLLOWS TABLE POLICIES
-- ==========================================

-- Users can view all follows (for transparency)
CREATE POLICY "Users can view follows" ON public.follows
    FOR SELECT USING (true);

-- Authenticated users can follow others
CREATE POLICY "Authenticated users can follow" ON public.follows
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        follower_id = auth.uid()
    );

-- Users can unfollow
CREATE POLICY "Users can unfollow" ON public.follows
    FOR DELETE USING (follower_id = auth.uid());

-- ==========================================
-- USER FOLLOWERS TABLE POLICIES
-- ==========================================

-- Same as follows table
CREATE POLICY "Users can view user followers" ON public.user_followers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow users" ON public.user_followers
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        follower_id = auth.uid()
    );

CREATE POLICY "Users can unfollow users" ON public.user_followers
    FOR DELETE USING (follower_id = auth.uid());

-- ==========================================
-- NOTIFICATIONS TABLE POLICIES
-- ==========================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- BOOKMARKS TABLE POLICIES
-- ==========================================

-- Users can only view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING (user_id = auth.uid());

-- Authenticated users can create bookmarks
CREATE POLICY "Authenticated users can bookmark" ON public.bookmarks
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- USER SKILLS TABLE POLICIES
-- ==========================================

-- Anyone can view user skills
CREATE POLICY "Anyone can view user skills" ON public.user_skills
    FOR SELECT USING (true);

-- Users can manage their own skills
CREATE POLICY "Users can manage own skills" ON public.user_skills
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==========================================
-- PROJECT COLLABORATORS TABLE POLICIES
-- ==========================================

-- Project team can view collaborators
CREATE POLICY "Project team can view collaborators" ON public.project_collaborators
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

-- Project owners can manage collaborators
CREATE POLICY "Project owners can manage collaborators" ON public.project_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

-- Users can update their own collaboration status
CREATE POLICY "Users can update own collaboration status" ON public.project_collaborators
    FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- ANALYTICS TABLES POLICIES
-- ==========================================

-- Analytics events - restricted access
CREATE POLICY "Limited access to analytics events" ON public.analytics_events
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

-- System can insert analytics events
CREATE POLICY "System can track analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- User sessions - users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage user sessions" ON public.user_sessions
    FOR ALL WITH CHECK (true);

-- ==========================================
-- BLOCKCHAIN AND STORAGE POLICIES
-- ==========================================

-- Email logs - restricted to system
CREATE POLICY "Limited access to email logs" ON public.email_logs
    FOR SELECT USING (false); -- System only

-- Blockchain transactions - public read
CREATE POLICY "Public can view blockchain transactions" ON public.blockchain_transactions
    FOR SELECT USING (true);

-- Blockchain records - public read
CREATE POLICY "Public can view blockchain records" ON public.blockchain_records
    FOR SELECT USING (true);

-- IPFS storage - based on visibility settings
CREATE POLICY "Users can view public IPFS files" ON public.ipfs_storage
    FOR SELECT USING (
        is_public = true OR 
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.creator_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can upload files" ON public.ipfs_storage
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        uploaded_by = auth.uid()
    );

-- ZKP commitments - public read for transparency
CREATE POLICY "Public can view ZKP commitments" ON public.zkp_commitments
    FOR SELECT USING (true);

CREATE POLICY "Users can create ZKP commitments" ON public.zkp_commitments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Security alerts - restricted access
CREATE POLICY "Limited access to security alerts" ON public.security_alerts
    FOR SELECT USING (
        user_id = auth.uid() OR
        -- Add admin role check here when implemented
        false
    );

-- ==========================================
-- HELPER FUNCTIONS FOR RLS
-- ==========================================

-- Function to check if user is admin (placeholder)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Implement admin check logic here
    -- For now, return false - update when admin system is implemented
    RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user is project collaborator
CREATE OR REPLACE FUNCTION is_project_collaborator(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_collaborators pc 
        WHERE pc.project_id = is_project_collaborator.project_id 
        AND pc.user_id = is_project_collaborator.user_id 
        AND pc.status = 'accepted'
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user is chat participant
CREATE OR REPLACE FUNCTION is_chat_participant(chat_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.chat_participants cp 
        WHERE cp.chat_id = is_chat_participant.chat_id 
        AND cp.user_id = is_chat_participant.user_id
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- ==========================================
-- NOTES ON SECURITY
-- ==========================================
-- 
-- These RLS policies provide:
-- 1. User privacy and data protection
-- 2. Project ownership verification
-- 3. Collaboration access control
-- 4. Public/private content separation
-- 5. Anonymous contribution support
-- 6. Chat security and privacy
-- 7. Analytics data protection
-- 8. Blockchain transparency
-- 
-- Additional security considerations:
-- 1. API rate limiting (implement at application level)
-- 2. Input validation and sanitization
-- 3. Audit logging for sensitive operations
-- 4. Regular security reviews
-- 5. Admin role implementation
-- 6. Two-factor authentication
-- 7. IP filtering for sensitive operations
-- 8. Database encryption at rest