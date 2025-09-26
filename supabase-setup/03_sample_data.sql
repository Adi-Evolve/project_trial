-- ==========================================
-- INITIAL DATA SEEDING
-- ==========================================
-- Sample data for testing ProjectForge platform
-- Execute AFTER running schema and RLS policies

-- ==========================================
-- SAMPLE USERS
-- ==========================================

-- Insert sample users (these would normally be created through auth)
-- NOTE: commented out to provide a clean starting DB without seeded users/projects.
-- INSERT INTO public.users (id, email, username, full_name, bio, skills, location, github_url, linkedin_url) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', 'alice@example.com', 'alice_dev', 'Alice Johnson', 'Full-stack developer passionate about blockchain and AI', ARRAY['React', 'Node.js', 'Python', 'Solidity'], 'San Francisco, CA', 'https://github.com/alicedev', 'https://linkedin.com/in/alicejohnson'),
-- ('550e8400-e29b-41d4-a716-446655440001', 'bob@example.com', 'bob_designer', 'Bob Smith', 'UX/UI designer with a love for creating intuitive user experiences', ARRAY['Figma', 'Adobe XD', 'React', 'TypeScript'], 'New York, NY', 'https://github.com/bobsmith', 'https://linkedin.com/in/bobsmith'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'carol@example.com', 'carol_blockchain', 'Carol Williams', 'Blockchain expert and smart contract developer', ARRAY['Solidity', 'Web3', 'Ethereum', 'JavaScript'], 'Austin, TX', 'https://github.com/carolwilliams', 'https://linkedin.com/in/carolwilliams'),
-- ('550e8400-e29b-41d4-a716-446655440003', 'david@example.com', 'david_ai', 'David Brown', 'Machine learning engineer and AI researcher', ARRAY['Python', 'TensorFlow', 'PyTorch', 'JavaScript'], 'Seattle, WA', 'https://github.com/davidbrown', 'https://linkedin.com/in/davidbrown');

-- ==========================================
-- SAMPLE IDEAS
-- ==========================================

-- INSERT INTO public.ideas (id, creator_id, title, description, category, tags, blockchain_hash, ipfs_hash, zkp_commitment, status) VALUES
-- ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Decentralized Social Media Platform', 'A blockchain-based social media platform that gives users full control over their data and content monetization', 'technology', ARRAY['blockchain', 'social-media', 'decentralization', 'web3'], '0x1234567890abcdef', 'QmX1234567890abcdef', 'zkp_commit_001', 'approved'),
-- ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'AI-Powered Code Review Tool', 'An intelligent code review system that uses machine learning to identify bugs, security vulnerabilities, and suggest improvements', 'technology', ARRAY['ai', 'machine-learning', 'developer-tools', 'automation'], '0x2345678901bcdef0', 'QmY2345678901bcdef0', 'zkp_commit_002', 'approved'),
-- ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Sustainable Energy Trading Platform', 'A marketplace for trading renewable energy credits using blockchain technology for transparency and efficiency', 'environment', ARRAY['blockchain', 'renewable-energy', 'trading', 'sustainability'], '0x3456789012cdef01', 'QmZ3456789012cdef01', 'zkp_commit_003', 'approved'),
-- ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Mental Health Support App', 'A mobile app connecting users with mental health professionals and peer support groups, with AI-powered mood tracking', 'health', ARRAY['mental-health', 'mobile-app', 'ai', 'healthcare'], '0x456789013def012', 'QmA456789013def012', 'zkp_commit_004', 'pending');

-- ==========================================
-- SAMPLE PROJECTS
-- ==========================================

-- INSERT INTO public.projects (id, creator_id, title, description, category, funding_goal, current_funding, status, required_skills, tags, blockchain_hash, ipfs_hash) VALUES
-- ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'EcoChain - Carbon Credit Marketplace', 'A blockchain-based marketplace for carbon credits with transparent tracking and verification of environmental impact', 'environment', 50000.00, 12500.00, 'active', ARRAY['Solidity', 'React', 'Node.js', 'Environmental Science'], ARRAY['blockchain', 'environment', 'carbon-credits', 'marketplace'], '0x789012def345678', 'QmB789012def345678'),
-- ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'StudyBuddy - Collaborative Learning Platform', 'An online platform that connects students for collaborative study sessions with AI-powered study plan recommendations', 'education', 25000.00, 8750.00, 'active', ARRAY['React', 'Python', 'Machine Learning', 'UX Design'], ARRAY['education', 'ai', 'collaboration', 'students'], '0x89012def3456789', 'QmC89012def3456789'),
-- ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'HealthVault - Secure Medical Records', 'A decentralized system for secure storage and sharing of medical records with patient-controlled access', 'health', 75000.00, 0.00, 'draft', ARRAY['Blockchain', 'Cryptography', 'Healthcare IT', 'React'], ARRAY['healthcare', 'blockchain', 'privacy', 'medical-records'], '0x9012def34567890', 'QmD9012def34567890');

-- ==========================================
-- SAMPLE MILESTONES
-- ==========================================

-- INSERT INTO public.milestones (id, project_id, title, description, target_date, funding_amount, status) VALUES
-- ('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Smart Contract Development', 'Develop and deploy smart contracts for carbon credit trading', '2024-03-15', 15000.00, 'completed'),
-- ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', 'Frontend Development', 'Build user interface for marketplace interactions', '2024-04-30', 20000.00, 'in_progress'),
-- ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', 'Beta Testing & Launch', 'Conduct beta testing and official platform launch', '2024-06-15', 15000.00, 'pending'),
-- ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'AI Algorithm Development', 'Develop machine learning algorithms for study recommendations', '2024-03-30', 10000.00, 'in_progress'),
-- ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'Platform Beta Release', 'Release beta version for student testing', '2024-05-15', 15000.00, 'pending');

-- ==========================================
-- SAMPLE CONTRIBUTIONS
-- ==========================================

-- INSERT INTO public.contributions (id, project_id, contributor_id, amount, transaction_hash, status, contribution_type, message) VALUES
-- ('990e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 5000.00, '0xabcdef123456789', 'confirmed', 'funding', 'Excited to support this environmental initiative!'),
-- ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 7500.00, '0xbcdef1234567890', 'confirmed', 'funding', 'Great project for combating climate change'),
-- ('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 3750.00, '0xcdef12345678901', 'confirmed', 'funding', 'Looking forward to using this platform'),
-- ('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5000.00, '0xdef123456789012', 'confirmed', 'funding', 'Education technology is the future');

-- ==========================================
-- SAMPLE COMMENTS
-- ==========================================

-- INSERT INTO public.comments (id, user_id, project_id, idea_id, content, parent_id) VALUES
-- ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', NULL, 'This is exactly what we need to accelerate carbon credit adoption. The transparency aspect is crucial.', NULL),
-- ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', NULL, 'Have you considered integrating with existing carbon registries like Verra or Gold Standard?', NULL),
-- ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', NULL, 'Yes, that''s part of our roadmap for Q3. Integration with major registries is essential for credibility.', 'aa0e8400-e29b-41d4-a716-446655440001'),
-- ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NULL, '660e8400-e29b-41d4-a716-446655440000', 'This idea has huge potential. Have you thought about implementing reputation systems for content creators?', NULL),
-- ('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', NULL, 'The AI-powered study recommendations sound innovative. What data will the algorithm use?', NULL);

-- ==========================================
-- SAMPLE VOTES
-- ==========================================

-- INSERT INTO public.votes (id, user_id, project_id, idea_id, vote_type, comment_id) VALUES
-- ('bb0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', NULL, 'up', NULL),
-- ('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', NULL, 'up', NULL),
-- ('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000', NULL, 'up', NULL),
-- ('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, '660e8400-e29b-41d4-a716-446655440000', 'up', NULL),
-- ('bb0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NULL, '660e8400-e29b-41d4-a716-446655440001', 'up', NULL),
-- ('bb0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', NULL, NULL, 'up', 'aa0e8400-e29b-41d4-a716-446655440000');

-- ==========================================
-- SAMPLE PROJECT LIKES
-- ==========================================

-- INSERT INTO public.project_likes (id, user_id, project_id) VALUES
-- ('cc0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000'),
-- ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000'),
-- ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000'),
-- ('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001'),
-- ('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001');

-- ==========================================
-- SAMPLE FOLLOWS
-- ==========================================

-- INSERT INTO public.follows (id, follower_id, following_id) VALUES
-- ('dd0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000'),
-- ('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000'),
-- ('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
-- ('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002'),
-- ('dd0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002');

-- ==========================================
-- SAMPLE NOTIFICATIONS
-- ==========================================

-- INSERT INTO public.notifications (id, user_id, type, title, message, metadata) VALUES
-- ('ee0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'contribution', 'New Contribution Received', 'Bob Smith contributed $5,000 to your project EcoChain', '{"project_id": "770e8400-e29b-41d4-a716-446655440000", "amount": 5000}'),
-- ('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'milestone', 'Milestone Completed', 'Smart Contract Development milestone has been completed', '{"milestone_id": "880e8400-e29b-41d4-a716-446655440000"}'),
-- ('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'comment', 'New Comment', 'Alice Johnson commented on your project StudyBuddy', '{"project_id": "770e8400-e29b-41d4-a716-446655440001"}'),
-- ('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'follow', 'New Follower', 'David Brown is now following you', '{"follower_id": "550e8400-e29b-41d4-a716-446655440003"}'),
-- ('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'idea_approved', 'Idea Approved', 'Your idea "AI-Powered Code Review Tool" has been approved', '{"idea_id": "660e8400-e29b-41d4-a716-446655440001"}');

-- ==========================================
-- SAMPLE BLOCKCHAIN TRANSACTIONS
-- ==========================================

-- INSERT INTO public.blockchain_transactions (id, transaction_hash, transaction_type, related_id, user_id, amount, gas_used, gas_price, status, network) VALUES
-- ('ff0e8400-e29b-41d4-a716-446655440000', '0xabcdef123456789', 'contribution', '990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 5000.00, 21000, 20.0, 'confirmed', 'ethereum'),
-- ('ff0e8400-e29b-41d4-a716-446655440001', '0xbcdef1234567890', 'contribution', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 7500.00, 21000, 22.0, 'confirmed', 'ethereum'),
-- ('ff0e8400-e29b-41d4-a716-446655440002', '0x1234567890abcdef', 'idea_creation', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 0.00, 50000, 25.0, 'confirmed', 'ethereum'),
-- ('ff0e8400-e29b-41d4-a716-446655440003', '0x789012def345678', 'project_creation', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 0.00, 75000, 23.0, 'confirmed', 'ethereum');

-- ==========================================
-- SAMPLE IPFS STORAGE
-- ==========================================

-- INSERT INTO public.ipfs_storage (id, ipfs_hash, original_filename, file_size, mime_type, uploaded_by, related_type, related_id, is_public) VALUES
-- ('110e8400-e29b-41d4-a716-446655440000', 'QmB789012def345678', 'ecochain_whitepaper.pdf', 2485760, 'application/pdf', '550e8400-e29b-41d4-a716-446655440000', 'project', '770e8400-e29b-41d4-a716-446655440000', true),
-- ('110e8400-e29b-41d4-a716-446655440001', 'QmC89012def3456789', 'studybuddy_mockups.zip', 15728640, 'application/zip', '550e8400-e29b-41d4-a716-446655440001', 'project', '770e8400-e29b-41d4-a716-446655440001', false),
-- ('110e8400-e29b-41d4-a716-446655440002', 'QmX1234567890abcdef', 'decentralized_social_media_proposal.pdf', 1048576, 'application/pdf', '550e8400-e29b-41d4-a716-446655440000', 'idea', '660e8400-e29b-41d4-a716-446655440000', true),
-- ('110e8400-e29b-41d4-a716-446655440003', 'QmY2345678901bcdef0', 'ai_code_review_architecture.png', 524288, 'image/png', '550e8400-e29b-41d4-a716-446655440001', 'idea', '660e8400-e29b-41d4-a716-446655440001', true);

-- ==========================================
-- UPDATE STATISTICS
-- ==========================================

-- Update user statistics
UPDATE public.users SET 
    projects_created = (SELECT COUNT(*) FROM public.projects WHERE creator_id = users.id),
    ideas_created = (SELECT COUNT(*) FROM public.ideas WHERE creator_id = users.id),
    total_contributed = (SELECT COALESCE(SUM(amount), 0) FROM public.contributions WHERE contributor_id = users.id AND status = 'confirmed'),
    reputation_score = (SELECT COUNT(*) * 10 FROM public.projects WHERE creator_id = users.id AND status = 'completed') + 
                      (SELECT COUNT(*) * 5 FROM public.ideas WHERE creator_id = users.id AND status = 'approved');

-- Update project statistics
UPDATE public.projects SET 
    total_likes = (SELECT COUNT(*) FROM public.project_likes WHERE project_id = projects.id),
    total_comments = (SELECT COUNT(*) FROM public.comments WHERE project_id = projects.id),
    total_votes = (SELECT COUNT(*) FROM public.votes WHERE project_id = projects.id);

-- Update idea statistics
UPDATE public.ideas SET 
    total_votes = (SELECT COUNT(*) FROM public.votes WHERE idea_id = ideas.id),
    total_comments = (SELECT COUNT(*) FROM public.comments WHERE idea_id = ideas.id);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Verify the data was inserted correctly
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Ideas', COUNT(*) FROM public.ideas
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Milestones', COUNT(*) FROM public.milestones
UNION ALL
SELECT 'Contributions', COUNT(*) FROM public.contributions
UNION ALL
SELECT 'Comments', COUNT(*) FROM public.comments
UNION ALL
SELECT 'Votes', COUNT(*) FROM public.votes
UNION ALL
SELECT 'Project Likes', COUNT(*) FROM public.project_likes
UNION ALL
SELECT 'Follows', COUNT(*) FROM public.follows
UNION ALL
SELECT 'Notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'Blockchain Transactions', COUNT(*) FROM public.blockchain_transactions
UNION ALL
SELECT 'IPFS Storage', COUNT(*) FROM public.ipfs_storage;