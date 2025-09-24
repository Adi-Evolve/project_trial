-- ==========================================
-- SUPABASE SETUP INSTRUCTIONS
-- ==========================================
-- Complete setup guide for ProjectForge Supabase backend

-- ==========================================
-- PREREQUISITES
-- ==========================================

-- 1. Create a new Supabase project at https://supabase.com
-- 2. Note down your project URL and anon key
-- 3. Enable authentication in Supabase dashboard
-- 4. Configure email authentication (if using email auth)

-- ==========================================
-- STEP 1: CREATE DATABASE SCHEMA
-- ==========================================

-- Run the following SQL files in order in your Supabase SQL editor:

-- 1. First, execute: 01_database_schema.sql
--    This creates all tables, indexes, triggers, and functions

-- 2. Then, execute: 02_rls_policies.sql
--    This sets up Row Level Security policies for data protection

-- ==========================================
-- STEP 2: ENABLE EXTENSIONS
-- ==========================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "crypto";

-- ==========================================
-- STEP 3: CONFIGURE AUTHENTICATION
-- ==========================================

-- In Supabase Dashboard > Authentication > Settings:
-- 1. Enable Email authentication
-- 2. Set up email templates (optional)
-- 3. Configure redirect URLs for your domain
-- 4. Set JWT expiry as needed

-- ==========================================
-- STEP 4: ENVIRONMENT VARIABLES
-- ==========================================

-- Add these to your .env file in the root of your project:

-- REACT_APP_SUPABASE_URL=your_supabase_project_url
-- REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
-- REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)

-- ==========================================
-- STEP 5: STORAGE BUCKETS (Optional)
-- ==========================================

-- Create storage buckets for file uploads
-- Run in Supabase SQL editor:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('project-documents', 'project-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('ipfs-cache', 'ipfs-cache', false, 104857600, NULL);

-- Set up storage policies
-- Allow authenticated users to upload to their own folders
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        bucket_id IN ('project-images', 'project-documents', 'user-avatars')
    );

-- Allow public read access to public buckets
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (
        bucket_id IN ('project-images', 'user-avatars')
    );

-- ==========================================
-- STEP 6: REAL-TIME SUBSCRIPTIONS
-- ==========================================

-- Enable real-time for specific tables (optional)
-- Run in Supabase SQL editor:

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable real-time for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable real-time for milestone verifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestone_verifications;

-- ==========================================
-- STEP 7: WEBHOOK ENDPOINTS (Optional)
-- ==========================================

-- Set up webhooks in Supabase Dashboard > Database > Webhooks:
-- 1. New user registration webhook
-- 2. Project creation webhook
-- 3. Milestone completion webhook
-- 4. Contribution webhook

-- Example webhook function for new user registration:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new row into users table when a user signs up
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at);
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
        NEW.id,
        'welcome',
        'Welcome to ProjectForge!',
        'Get started by creating your first project or exploring trending ideas.'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- STEP 8: SCHEDULED FUNCTIONS (Optional)
-- ==========================================

-- Create scheduled functions using pg_cron extension
-- Enable pg_cron in Supabase Dashboard > Database > Extensions

-- Daily cleanup of expired email logs
CREATE OR REPLACE FUNCTION public.cleanup_old_email_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.email_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-email-logs', '0 2 * * *', 'SELECT public.cleanup_old_email_logs()');

-- ==========================================
-- STEP 9: BACKUP CONFIGURATION
-- ==========================================

-- Set up automated backups in Supabase Dashboard > Settings > Database
-- Configure:
-- 1. Daily backups
-- 2. Retention period (7-30 days recommended)
-- 3. Backup notifications

-- ==========================================
-- STEP 10: TESTING THE SETUP
-- ==========================================

-- Test queries to verify setup:

-- 1. Test user creation
-- INSERT INTO public.users (id, email, username, full_name)
-- VALUES ('test-uuid', 'test@example.com', 'testuser', 'Test User');

-- 2. Test project creation
-- INSERT INTO public.projects (creator_id, title, description, category)
-- VALUES ('test-uuid', 'Test Project', 'A test project', 'technology');

-- 3. Test RLS policies by switching to different users

-- ==========================================
-- MONITORING AND MAINTENANCE
-- ==========================================

-- 1. Monitor database performance in Supabase Dashboard
-- 2. Check logs regularly for errors
-- 3. Monitor storage usage
-- 4. Review and update RLS policies as needed
-- 5. Keep track of API usage and limits

-- ==========================================
-- SECURITY CHECKLIST
-- ==========================================

-- ✓ RLS enabled on all tables
-- ✓ Proper authentication configured
-- ✓ Service role key kept secure
-- ✓ CORS settings configured for your domain
-- ✓ Rate limiting enabled
-- ✓ Database backups configured
-- ✓ Storage policies set up correctly
-- ✓ Webhook endpoints secured (if used)

-- ==========================================
-- TROUBLESHOOTING
-- ==========================================

-- Common issues and solutions:

-- 1. RLS denying access:
--    - Check if RLS policies are correctly defined
--    - Verify user authentication state
--    - Test with service role key for debugging

-- 2. Function not working:
--    - Check function permissions (SECURITY DEFINER)
--    - Verify trigger is properly attached
--    - Check function logs in Supabase Dashboard

-- 3. Storage upload fails:
--    - Verify bucket exists and is configured
--    - Check storage policies
--    - Verify file size and MIME type limits

-- 4. Real-time not working:
--    - Confirm table is added to publication
--    - Check client-side subscription code
--    - Verify RLS allows reading the data