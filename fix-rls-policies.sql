-- SQL Script to Fix RLS Policies for Development/Testing
-- Run this in your Supabase SQL Editor to allow data insertion

-- =====================================================
-- TEMPORARY RLS POLICIES FOR DEVELOPMENT 
-- WARNING: These are permissive policies for testing
-- Restrict them in production!
-- =====================================================

-- 1. Allow anonymous users to register (insert into users table)
CREATE POLICY "allow_anonymous_user_registration" ON public.users
  FOR INSERT 
  WITH CHECK (true);

-- Allow anonymous users to read users (needed for login checks)
CREATE POLICY "allow_anonymous_user_read" ON public.users
  FOR SELECT 
  USING (true);

-- Allow users to update their own records
CREATE POLICY "allow_user_update_own" ON public.users
  FOR UPDATE 
  USING (auth.uid()::text = id::text OR true) -- Allow anonymous updates for testing
  WITH CHECK (auth.uid()::text = id::text OR true);

-- =====================================================

-- 2. Allow anonymous project creation and reading
CREATE POLICY "allow_anonymous_project_insert" ON public.projects
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_project_read" ON public.projects
  FOR SELECT 
  USING (true);

CREATE POLICY "allow_anonymous_project_update" ON public.projects
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =====================================================

-- 3. Allow anonymous contributions (for donation testing)
CREATE POLICY "allow_anonymous_contribution_insert" ON public.contributions
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_contribution_read" ON public.contributions
  FOR SELECT 
  USING (true);

CREATE POLICY "allow_anonymous_contribution_update" ON public.contributions
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =====================================================

-- 4. Allow anonymous blockchain transaction logging
CREATE POLICY "allow_anonymous_blockchain_tx_insert" ON public.blockchain_transactions
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_blockchain_tx_read" ON public.blockchain_transactions
  FOR SELECT 
  USING (true);

CREATE POLICY "allow_anonymous_blockchain_tx_update" ON public.blockchain_transactions
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =====================================================

-- 5. Allow anonymous chat operations (for testing)
CREATE POLICY "allow_anonymous_chat_insert" ON public.chats
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_chat_read" ON public.chats
  FOR SELECT 
  USING (true);

-- Chat messages
CREATE POLICY "allow_anonymous_chat_message_insert" ON public.chat_messages
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_chat_message_read" ON public.chat_messages
  FOR SELECT 
  USING (true);

-- Chat participants  
CREATE POLICY "allow_anonymous_chat_participant_insert" ON public.chat_participants
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_chat_participant_read" ON public.chat_participants
  FOR SELECT 
  USING (true);

-- =====================================================

-- 6. Allow anonymous operations on other tables
CREATE POLICY "allow_anonymous_idea_operations" ON public.ideas
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_notification_operations" ON public.notifications
  FOR ALL 
  USING (true)  
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_milestone_operations" ON public.milestones
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_comment_operations" ON public.comments
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check which policies exist
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS status on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;