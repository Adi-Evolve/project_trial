-- =====================================================
-- PROJECTFORGE SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Run this file AFTER running supabase-schema.sql to set up security policies

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on all main tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills_needed ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_skills_needed ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_looking_for ENABLE ROW LEVEL SECURITY;

ALTER TABLE project_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_milestones ENABLE ROW LEVEL SECURITY;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- =====================================================

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid,
        null
    );
$$ LANGUAGE sql STABLE;

-- Function to check if user owns a project
CREATE OR REPLACE FUNCTION is_project_owner(project_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND owner_id = auth.user_id()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user is project collaborator
CREATE OR REPLACE FUNCTION is_project_collaborator(project_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM project_collaborators 
        WHERE project_id = project_id 
        AND user_id = auth.user_id() 
        AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user has project access (owner or collaborator)
CREATE OR REPLACE FUNCTION has_project_access(project_id UUID) RETURNS BOOLEAN AS $$
    SELECT is_project_owner(project_id) OR is_project_collaborator(project_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if project is public
CREATE OR REPLACE FUNCTION is_project_public(project_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND visibility = 'public'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user owns an idea
CREATE OR REPLACE FUNCTION is_idea_owner(idea_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM ideas 
        WHERE id = idea_id AND author_id = auth.user_id()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if idea is public
CREATE OR REPLACE FUNCTION is_idea_public(idea_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM ideas 
        WHERE id = idea_id AND visibility = 'public'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================
-- USER POLICIES
-- =====================================================

-- Users can view all public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.user_id());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (id = auth.user_id());

-- User skills policies
CREATE POLICY "Users can view all skills" ON user_skills
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own skills" ON user_skills
    FOR ALL USING (user_id = auth.user_id());

-- User interests policies
CREATE POLICY "Users can view all interests" ON user_interests
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own interests" ON user_interests
    FOR ALL USING (user_id = auth.user_id());

-- User sessions policies
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.user_id());

-- =====================================================
-- PROJECT POLICIES
-- =====================================================

-- Project viewing policies
CREATE POLICY "Public projects are viewable by everyone" ON projects
    FOR SELECT USING (
        visibility = 'public' OR 
        owner_id = auth.user_id() OR 
        is_project_collaborator(id)
    );

-- Project creation policy
CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND owner_id = auth.user_id());

-- Project update policy
CREATE POLICY "Project owners can update projects" ON projects
    FOR UPDATE USING (owner_id = auth.user_id());

-- Project deletion policy
CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE USING (owner_id = auth.user_id());

-- Project tags policies
CREATE POLICY "Everyone can view project tags" ON project_tags
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage tags" ON project_tags
    FOR ALL USING (is_project_owner(project_id));

-- Project requirements policies
CREATE POLICY "Everyone can view public project requirements" ON project_requirements
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project team can manage requirements" ON project_requirements
    FOR ALL USING (has_project_access(project_id));

-- Project skills needed policies
CREATE POLICY "Everyone can view public project skills" ON project_skills_needed
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage skills needed" ON project_skills_needed
    FOR ALL USING (is_project_owner(project_id));

-- Project collaborators policies
CREATE POLICY "Everyone can view public project collaborators" ON project_collaborators
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
    FOR INSERT WITH CHECK (is_project_owner(project_id));

CREATE POLICY "Project owners can update collaborators" ON project_collaborators
    FOR UPDATE USING (is_project_owner(project_id));

CREATE POLICY "Project owners and collaborators can leave" ON project_collaborators
    FOR DELETE USING (
        is_project_owner(project_id) OR 
        user_id = auth.user_id()
    );

-- Project media policies
CREATE POLICY "Everyone can view public project media" ON project_media
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project team can manage media" ON project_media
    FOR ALL USING (has_project_access(project_id));

-- =====================================================
-- IDEA POLICIES
-- =====================================================

-- Ideas viewing policies
CREATE POLICY "Public ideas are viewable by everyone" ON ideas
    FOR SELECT USING (
        visibility = 'public' OR 
        author_id = auth.user_id()
    );

-- Ideas creation policy
CREATE POLICY "Authenticated users can create ideas" ON ideas
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND author_id = auth.user_id());

-- Ideas update policy
CREATE POLICY "Idea owners can update ideas" ON ideas
    FOR UPDATE USING (author_id = auth.user_id());

-- Ideas deletion policy
CREATE POLICY "Idea owners can delete ideas" ON ideas
    FOR DELETE USING (author_id = auth.user_id());

-- Idea tags policies
CREATE POLICY "Everyone can view public idea tags" ON idea_tags
    FOR SELECT USING (
        is_idea_public(idea_id) OR 
        is_idea_owner(idea_id)
    );

CREATE POLICY "Idea owners can manage tags" ON idea_tags
    FOR ALL USING (is_idea_owner(idea_id));

-- Idea skills needed policies
CREATE POLICY "Everyone can view public idea skills" ON idea_skills_needed
    FOR SELECT USING (
        is_idea_public(idea_id) OR 
        is_idea_owner(idea_id)
    );

CREATE POLICY "Idea owners can manage skills needed" ON idea_skills_needed
    FOR ALL USING (is_idea_owner(idea_id));

-- Idea looking for policies
CREATE POLICY "Everyone can view public idea requirements" ON idea_looking_for
    FOR SELECT USING (
        is_idea_public(idea_id) OR 
        is_idea_owner(idea_id)
    );

CREATE POLICY "Idea owners can manage requirements" ON idea_looking_for
    FOR ALL USING (is_idea_owner(idea_id));

-- =====================================================
-- FUNDING POLICIES
-- =====================================================

-- Project funding viewing policies
CREATE POLICY "Everyone can view public project funding" ON project_funding
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id) OR 
        funder_id = auth.user_id()
    );

-- Funding creation policy
CREATE POLICY "Authenticated users can fund projects" ON project_funding
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND funder_id = auth.user_id());

-- Funding update policy (for status updates)
CREATE POLICY "Funders and project owners can update funding records" ON project_funding
    FOR UPDATE USING (
        funder_id = auth.user_id() OR 
        is_project_owner(project_id)
    );

-- Funding milestones policies
CREATE POLICY "Everyone can view public funding milestones" ON funding_milestones
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project owners can manage funding milestones" ON funding_milestones
    FOR ALL USING (is_project_owner(project_id));

-- =====================================================
-- INTERACTION POLICIES
-- =====================================================

-- Comments policies
CREATE POLICY "Everyone can view public comments" ON comments
    FOR SELECT USING (
        (target_type = 'project' AND is_project_public(target_id)) OR
        (target_type = 'idea' AND is_idea_public(target_id)) OR
        has_project_access(target_id) OR
        author_id = auth.user_id()
    );

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND author_id = auth.user_id());

CREATE POLICY "Comment authors can update their comments" ON comments
    FOR UPDATE USING (author_id = auth.user_id());

CREATE POLICY "Comment authors can delete their comments" ON comments
    FOR DELETE USING (author_id = auth.user_id());

-- Votes policies
CREATE POLICY "Everyone can view votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND user_id = auth.user_id());

CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (user_id = auth.user_id());

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
    FOR ALL USING (user_id = auth.user_id());

-- =====================================================
-- PROJECT MANAGEMENT POLICIES
-- =====================================================

-- Milestones policies
CREATE POLICY "Everyone can view public project milestones" ON milestones
    FOR SELECT USING (
        is_project_public(project_id) OR 
        has_project_access(project_id)
    );

CREATE POLICY "Project team can manage milestones" ON milestones
    FOR ALL USING (has_project_access(project_id));

-- Milestone tasks policies
CREATE POLICY "Project team can view milestone tasks" ON milestone_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM milestones m 
            WHERE m.id = milestone_tasks.milestone_id 
            AND (is_project_public(m.project_id) OR has_project_access(m.project_id))
        )
    );

CREATE POLICY "Project team can manage milestone tasks" ON milestone_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM milestones m 
            WHERE m.id = milestone_tasks.milestone_id 
            AND has_project_access(m.project_id)
        )
    );

-- Project updates policies
CREATE POLICY "Everyone can view public project updates" ON project_updates
    FOR SELECT USING (
        visibility = 'public' AND is_project_public(project_id) OR
        has_project_access(project_id) OR
        author_id = auth.user_id()
    );

CREATE POLICY "Project team can create updates" ON project_updates
    FOR INSERT WITH CHECK (
        auth.user_id() IS NOT NULL AND 
        author_id = auth.user_id() AND 
        has_project_access(project_id)
    );

CREATE POLICY "Update authors can edit their updates" ON project_updates
    FOR UPDATE USING (author_id = auth.user_id());

CREATE POLICY "Update authors can delete their updates" ON project_updates
    FOR DELETE USING (author_id = auth.user_id());

-- =====================================================
-- NOTIFICATION POLICIES
-- =====================================================

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.user_id());

-- Chat messages policies
CREATE POLICY "Project team can view chat messages" ON chat_messages
    FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Project team can send chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.user_id() IS NOT NULL AND 
        sender_id = auth.user_id() AND 
        has_project_access(project_id)
    );

CREATE POLICY "Message senders can edit their messages" ON chat_messages
    FOR UPDATE USING (sender_id = auth.user_id());

CREATE POLICY "Message senders can delete their messages" ON chat_messages
    FOR DELETE USING (sender_id = auth.user_id());

-- =====================================================
-- SECURITY AND AUDIT POLICIES
-- =====================================================

-- Security audit logs policies (admin only)
CREATE POLICY "Only system can manage audit logs" ON security_audit_logs
    FOR ALL USING (false); -- Restrict to system/admin only

-- Fraud reports policies
CREATE POLICY "Everyone can view resolved fraud reports" ON fraud_reports
    FOR SELECT USING (status = 'resolved' OR reporter_id = auth.user_id());

CREATE POLICY "Authenticated users can create fraud reports" ON fraud_reports
    FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND reporter_id = auth.user_id());

CREATE POLICY "Reporters can view their own reports" ON fraud_reports
    FOR SELECT USING (reporter_id = auth.user_id());

-- Blockchain records policies
CREATE POLICY "Everyone can view verified blockchain records" ON blockchain_records
    FOR SELECT USING (verified = true);

CREATE POLICY "Record owners can view their records" ON blockchain_records
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "System can create blockchain records" ON blockchain_records
    FOR INSERT WITH CHECK (true); -- Allow system to create records

-- =====================================================
-- ANALYTICS POLICIES
-- =====================================================

-- User activity policies
CREATE POLICY "Users can view their own activity" ON user_activity
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "System can log user activity" ON user_activity
    FOR INSERT WITH CHECK (true); -- Allow system to log activity

-- Project views policies
CREATE POLICY "Project owners can view their project analytics" ON project_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_views.project_id 
            AND projects.owner_id = auth.user_id()
        )
    );

CREATE POLICY "System can log project views" ON project_views
    FOR INSERT WITH CHECK (true); -- Allow system to log views

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('project-images', 'project-images', true),
    ('project-videos', 'project-videos', true),
    ('project-documents', 'project-documents', false),
    ('idea-attachments', 'idea-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.user_id()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.user_id()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.user_id()::text = (storage.foldername(name))[1]
    );

-- Project images storage policies
CREATE POLICY "Project images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Project owners can upload project images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-images' AND 
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id::text = (storage.foldername(name))[1] 
            AND projects.owner_id = auth.user_id()
        )
    );

-- Project videos storage policies
CREATE POLICY "Project videos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-videos');

CREATE POLICY "Project owners can upload project videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-videos' AND 
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id::text = (storage.foldername(name))[1] 
            AND projects.owner_id = auth.user_id()
        )
    );

-- Project documents storage policies (private)
CREATE POLICY "Project team can view project documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-documents' AND 
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id::text = (storage.foldername(name))[1] 
            AND has_project_access(projects.id)
        )
    );

CREATE POLICY "Project team can upload project documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-documents' AND 
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id::text = (storage.foldername(name))[1] 
            AND has_project_access(projects.id)
        )
    );

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS POLICIES
-- =====================================================

-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_funding;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE project_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;

-- =====================================================
-- END OF SECURITY POLICIES
-- =====================================================

COMMENT ON SCHEMA public IS 'ProjectForge Security Policies - Complete RLS implementation';