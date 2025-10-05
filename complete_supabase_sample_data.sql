-- ==========================================
-- SAMPLE DATA FOR PROJECTFORGE DEVELOPMENT
-- ==========================================
-- This file contains sample data for testing and development
-- Execute after running schema and RLS policies

-- ==========================================
-- SAMPLE USERS
-- ==========================================

-- Note: In production, user IDs come from Supabase Auth
-- These are example UUIDs for development/testing

INSERT INTO public.users (id, username, email, full_name, avatar_url, bio, skills, location, website, github_username, linkedin_profile, is_verified, total_contributions, total_projects, reputation_score, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alice_dev', 'alice@example.com', 'Alice Johnson', 'https://picsum.photos/200/200?random=1', 'Full-stack developer passionate about blockchain and decentralized systems. Love building innovative projects that solve real-world problems.', ARRAY['React', 'Node.js', 'Solidity', 'Python', 'TypeScript'], 'San Francisco, CA', 'https://alice-portfolio.com', 'alicej', 'alice-johnson-dev', true, 25000.00, 5, 850, 'user'),

('550e8400-e29b-41d4-a716-446655440001', 'bob_designer', 'bob@example.com', 'Bob Chen', 'https://picsum.photos/200/200?random=2', 'UX/UI designer with 8 years of experience. Specialized in creating intuitive interfaces for complex applications.', ARRAY['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'HTML/CSS'], 'New York, NY', 'https://bobchen.design', 'bobchen', 'bob-chen-design', true, 18500.00, 3, 720, 'user'),

('550e8400-e29b-41d4-a716-446655440002', 'charlie_pm', 'charlie@example.com', 'Charlie Rodriguez', 'https://picsum.photos/200/200?random=3', 'Product manager and entrepreneur. Founded 2 startups, love coordinating teams and bringing ideas to life.', ARRAY['Project Management', 'Strategy', 'Analytics', 'Marketing', 'Leadership'], 'Austin, TX', 'https://charlierodriguez.com', 'charliep', 'charlie-rodriguez-pm', false, 12000.00, 2, 650, 'user'),

('550e8400-e29b-41d4-a716-446655440003', 'diana_blockchain', 'diana@example.com', 'Diana Kumar', 'https://picsum.photos/200/200?random=4', 'Blockchain architect and smart contract specialist. Building the future of decentralized finance.', ARRAY['Solidity', 'Web3', 'DeFi', 'Smart Contracts', 'Rust'], 'London, UK', 'https://dianak.tech', 'dianakumar', 'diana-kumar-blockchain', true, 35000.00, 8, 920, 'user'),

('550e8400-e29b-41d4-a716-446655440004', 'evan_data', 'evan@example.com', 'Evan Thompson', 'https://picsum.photos/200/200?random=5', 'Data scientist and ML engineer. Turning data into insights and building intelligent systems.', ARRAY['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'SQL'], 'Seattle, WA', 'https://evanthompson.ai', 'evanthompson', 'evan-thompson-data', true, 22000.00, 4, 780, 'user');

-- ==========================================
-- SAMPLE PROJECTS
-- ==========================================

INSERT INTO public.projects (id, title, description, creator_id, funding_goal, current_funding, deadline, status, project_type, tags, difficulty_level, estimated_duration, required_skills, is_featured, views_count, blockchain_verified) VALUES
('650e8400-e29b-41d4-a716-446655440000', 'DeFi Lending Platform', 'A decentralized lending platform that allows users to lend and borrow cryptocurrencies with competitive rates. Features include automated market making, yield farming, and governance tokens.', '550e8400-e29b-41d4-a716-446655440000', 50000.00, 32500.00, '2024-06-15 23:59:59', 'active', 'development', ARRAY['DeFi', 'Blockchain', 'Smart Contracts', 'React', 'Solidity'], 'advanced', '6 months', ARRAY['Solidity', 'React', 'Web3', 'Smart Contract Security'], true, 1250, true),

('650e8400-e29b-41d4-a716-446655440001', 'AI-Powered Learning Assistant', 'An intelligent tutoring system that adapts to individual learning styles using machine learning. Provides personalized study plans and real-time feedback.', '550e8400-e29b-41d4-a716-446655440004', 35000.00, 18750.00, '2024-05-30 23:59:59', 'active', 'development', ARRAY['AI', 'Machine Learning', 'Education', 'Python', 'NLP'], 'intermediate', '4 months', ARRAY['Python', 'TensorFlow', 'NLP', 'React'], false, 890, false),

('650e8400-e29b-41d4-a716-446655440002', 'Sustainable Supply Chain Tracker', 'Blockchain-based supply chain tracking system for sustainable products. Allows consumers to verify product origins and environmental impact.', '550e8400-e29b-41d4-a716-446655440003', 40000.00, 40000.00, '2024-04-20 23:59:59', 'funded', 'development', ARRAY['Sustainability', 'Blockchain', 'Supply Chain', 'IoT'], 'advanced', '5 months', ARRAY['Blockchain', 'IoT', 'Node.js', 'React'], true, 2100, true),

('650e8400-e29b-41d4-a716-446655440003', 'Community Garden App', 'Mobile app connecting community gardeners, sharing resources, and tracking plant growth. Includes marketplace for seed/tool exchange.', '550e8400-e29b-41d4-a716-446655440002', 15000.00, 8500.00, '2024-07-10 23:59:59', 'active', 'mobile', ARRAY['Community', 'Sustainability', 'Mobile', 'React Native'], 'beginner', '3 months', ARRAY['React Native', 'Node.js', 'Mobile Development'], false, 650, false),

('650e8400-e29b-41d4-a716-446655440004', 'Open Source Code Review Tool', 'Collaborative code review platform with AI-assisted suggestions, automated testing integration, and developer analytics.', '550e8400-e29b-41d4-a716-446655440001', 25000.00, 12000.00, '2024-08-15 23:59:59', 'active', 'open-source', ARRAY['Open Source', 'Developer Tools', 'AI', 'Code Review'], 'intermediate', '4 months', ARRAY['React', 'Node.js', 'AI/ML', 'GitHub API'], false, 780, false);

-- ==========================================
-- SAMPLE IDEAS
-- ==========================================

INSERT INTO public.ideas (id, title, description, creator_id, category, tags, status, votes_count, implementation_difficulty, potential_impact) VALUES
('750e8400-e29b-41d4-a716-446655440000', 'Decentralized Social Media Platform', 'A social media platform where users own their data and content. Built on blockchain with tokenized engagement and creator rewards.', '550e8400-e29b-41d4-a716-446655440003', 'social', ARRAY['Blockchain', 'Social Media', 'Decentralization', 'Web3'], 'approved', 45, 'high', 'high'),

('750e8400-e29b-41d4-a716-446655440001', 'Carbon Credit Marketplace', 'Peer-to-peer marketplace for trading verified carbon credits with blockchain transparency and automated verification.', '550e8400-e29b-41d4-a716-446655440002', 'environmental', ARRAY['Environment', 'Blockchain', 'Carbon Credits', 'Marketplace'], 'approved', 38, 'medium', 'high'),

('750e8400-e29b-41d4-a716-446655440002', 'AR Furniture Placement App', 'Augmented reality app that lets users visualize furniture in their space before purchasing. Includes 3D model library.', '550e8400-e29b-41d4-a716-446655440001', 'technology', ARRAY['AR', 'Mobile', 'E-commerce', '3D Modeling'], 'pending', 22, 'medium', 'medium'),

('750e8400-e29b-41d4-a716-446655440003', 'Local Food Network', 'Platform connecting local farmers with consumers, reducing food waste and supporting local agriculture.', '550e8400-e29b-41d4-a716-446655440000', 'community', ARRAY['Local Food', 'Agriculture', 'Sustainability', 'Community'], 'approved', 31, 'low', 'medium'),

('750e8400-e29b-41d4-a716-446655440004', 'Mental Health Companion Bot', 'AI-powered chatbot providing 24/7 mental health support with mood tracking and crisis intervention features.', '550e8400-e29b-41d4-a716-446655440004', 'health', ARRAY['Mental Health', 'AI', 'Healthcare', 'Chatbot'], 'approved', 56, 'high', 'high');

-- ==========================================
-- SAMPLE PROJECT UPDATES
-- ==========================================

INSERT INTO public.project_updates (id, project_id, author_id, title, content, update_type, is_public) VALUES
('850e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Smart Contract Development Complete', 'We''ve successfully completed the core smart contracts for the lending protocol. All contracts have been audited and deployed to testnet. Next phase involves frontend integration and additional testing.', 'milestone', true),

('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'ML Model Training Progress', 'The personalized learning algorithm is showing promising results with 85% accuracy in predicting optimal learning paths. Currently working on improving response time and adding more subject areas.', 'progress', true),

('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Beta Testing Phase Started', 'We''ve launched beta testing with 50 supply chain partners. Initial feedback is very positive, with 92% satisfaction rate. Making final UI adjustments based on user feedback.', 'milestone', true);

-- ==========================================
-- SAMPLE COMMUNITY CHALLENGES
-- ==========================================

INSERT INTO public.community_challenges (id, title, description, created_by, prize_amount, start_date, end_date, status, participation_count, required_skills) VALUES
('950e8400-e29b-41d4-a716-446655440000', 'Build the Future of DeFi', 'Create innovative DeFi solutions that address real-world financial inclusion challenges. Focus on accessibility and user experience.', '550e8400-e29b-41d4-a716-446655440003', 10000.00, '2024-03-01 00:00:00', '2024-05-31 23:59:59', 'active', 23, ARRAY['Solidity', 'DeFi', 'Smart Contracts', 'Frontend Development']),

('950e8400-e29b-41d4-a716-446655440001', 'Sustainable Tech Challenge', 'Develop technology solutions that help combat climate change and promote environmental sustainability.', '550e8400-e29b-41d4-a716-446655440002', 5000.00, '2024-02-15 00:00:00', '2024-04-30 23:59:59', 'active', 18, ARRAY['Environmental Tech', 'IoT', 'Data Analysis', 'Mobile Development']);

-- ==========================================
-- SAMPLE CONTRIBUTIONS
-- ==========================================

INSERT INTO public.contributions (id, project_id, contributor_id, amount, contribution_type, transaction_hash, is_anonymous, message) VALUES
('a50e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 5000.00, 'funding', '0x1234567890abcdef1234567890abcdef12345678', false, 'Excited to support this innovative DeFi project! Looking forward to the launch.'),

('a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 10000.00, 'funding', '0x2345678901bcdef12345678901bcdef123456789', false, 'This project aligns perfectly with my investment thesis. Happy to contribute!'),

('a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 7500.00, 'funding', '0x3456789012cdef123456789012cdef1234567890', false, 'AI in education is the future. Proud to support this initiative.'),

('a50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 15000.00, 'funding', '0x456789013def123456789013def12345678901a', false, 'Sustainability is crucial. This project can make a real difference.'),

('a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 3000.00, 'funding', '0x56789014ef123456789014ef123456789012ab', false, 'Love community-focused projects. Keep up the great work!');

-- ==========================================
-- SAMPLE ESCROW MILESTONES
-- ==========================================

INSERT INTO public.escrow_milestones (id, project_id, title, description, target_amount, required_votes, status) VALUES
('b50e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'Smart Contract Deployment', 'Deploy core smart contracts to mainnet with full audit completion', 20000.00, 3, 'completed'),

('b50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', 'Frontend Integration', 'Complete frontend integration with deployed smart contracts', 15000.00, 3, 'in_progress'),

('b50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Beta Release', 'Launch beta version with core AI features', 12000.00, 2, 'pending');

-- ==========================================
-- SAMPLE ESCROW RELEASES
-- ==========================================

INSERT INTO public.escrow_releases (id, project_id, milestone_id, amount, released_to, transaction_hash, reason) VALUES
('c50e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'b50e8400-e29b-41d4-a716-446655440000', 20000.00, '550e8400-e29b-41d4-a716-446655440000', '0x789012ef123456789015ef123456789012abc3', 'Milestone completed successfully. Smart contracts deployed and audited.');

-- ==========================================
-- SAMPLE CHATS
-- ==========================================

INSERT INTO public.chats (id, title, description, created_by, is_group, project_id) VALUES
('d50e8400-e29b-41d4-a716-446655440000', 'DeFi Project Team', 'Main discussion channel for the DeFi lending platform project', '550e8400-e29b-41d4-a716-446655440000', true, '650e8400-e29b-41d4-a716-446655440000'),

('d50e8400-e29b-41d4-a716-446655440001', 'AI Learning Project', 'Coordination channel for AI learning assistant development', '550e8400-e29b-41d4-a716-446655440004', true, '650e8400-e29b-41d4-a716-446655440001'),

('d50e8400-e29b-41d4-a716-446655440002', 'Alice & Bob Direct', 'Private conversation between Alice and Bob', '550e8400-e29b-41d4-a716-446655440000', false, NULL);

-- ==========================================
-- SAMPLE CHAT PARTICIPANTS
-- ==========================================

INSERT INTO public.chat_participants (id, chat_id, user_id, role) VALUES
('e50e8400-e29b-41d4-a716-446655440000', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
('e50e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('e50e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'member'),

('e50e8400-e29b-41d4-a716-446655440003', 'd50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'admin'),
('e50e8400-e29b-41d4-a716-446655440004', 'd50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member'),

('e50e8400-e29b-41d4-a716-446655440005', 'd50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
('e50e8400-e29b-41d4-a716-446655440006', 'd50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'member');

-- ==========================================
-- SAMPLE CHAT MESSAGES
-- ==========================================

INSERT INTO public.chat_messages (id, chat_id, sender_id, content, message_type) VALUES
('f50e8400-e29b-41d4-a716-446655440000', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to the DeFi project team chat! Let''s coordinate our efforts here.', 'text'),

('f50e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Excited to be part of this project! I''ve been reviewing the smart contract specifications.', 'text'),

('f50e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Great! I''m working on the project roadmap and milestone definitions. Should have it ready by tomorrow.', 'text'),

('f50e8400-e29b-41d4-a716-446655440003', 'd50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'The ML model training is progressing well. We''re seeing 85% accuracy on the test dataset.', 'text'),

('f50e8400-e29b-41d4-a716-446655440004', 'd50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Hey Bob! Just wanted to discuss the UI mockups you sent. They look great!', 'text');

-- ==========================================
-- SAMPLE COMMENTS
-- ==========================================

INSERT INTO public.comments (id, content, user_id, project_id, parent_id) VALUES
('0a0e8400-e29b-41d4-a716-446655440000', 'This DeFi project looks very promising! The automated market making feature could be a game-changer.', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', NULL),

('0a0e8400-e29b-41d4-a716-446655440001', 'I agree! Have you considered integrating with existing DeFi protocols for better liquidity?', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440000', '0a0e8400-e29b-41d4-a716-446655440000'),

('0a0e8400-e29b-41d4-a716-446655440002', 'That''s definitely on our roadmap! We''re looking at Uniswap and Compound integration.', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '0a0e8400-e29b-41d4-a716-446655440001'),

('0a0e8400-e29b-41d4-a716-446655440003', 'The AI learning assistant concept is brilliant. As an educator, I can see huge potential here.', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NULL),

('0a0e8400-e29b-41d4-a716-446655440004', 'Love the community garden app idea! This could really help local food systems.', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', NULL);

-- ==========================================
-- SAMPLE VOTES
-- ==========================================

INSERT INTO public.votes (id, user_id, project_id, idea_id, vote_type) VALUES
('1a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', NULL, 'upvote'),
('1a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', NULL, 'upvote'),
('1a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', NULL, 'upvote'),
('1a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, '750e8400-e29b-41d4-a716-446655440000', 'upvote'),
('1a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', NULL, '750e8400-e29b-41d4-a716-446655440004', 'upvote');

-- ==========================================
-- SAMPLE PROJECT LIKES
-- ==========================================

INSERT INTO public.project_likes (id, user_id, project_id) VALUES
('2a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000'),
('2a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000'),
('2a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440000'),
('2a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001'),
('2a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440002');

-- ==========================================
-- SAMPLE FOLLOWS
-- ==========================================

INSERT INTO public.follows (id, follower_id, following_id) VALUES
('3a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000'),
('3a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000'),
('3a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('3a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003'),
('3a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003');

-- ==========================================
-- SAMPLE USER FOLLOWERS
-- ==========================================

INSERT INTO public.user_followers (id, user_id, follower_id) VALUES
('4a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
('4a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002'),
('4a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003'),
('4a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('4a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000');

-- ==========================================
-- SAMPLE NOTIFICATIONS
-- ==========================================

INSERT INTO public.notifications (id, user_id, title, message, notification_type, related_id, is_read) VALUES
('5a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'New Contribution Received', 'Bob Chen contributed $5,000 to your DeFi Lending Platform project!', 'contribution', '650e8400-e29b-41d4-a716-446655440000', false),

('5a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Milestone Completed', 'Smart Contract Deployment milestone has been completed and funds released.', 'milestone', 'b50e8400-e29b-41d4-a716-446655440000', true),

('5a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'New Follower', 'Alice Johnson is now following you!', 'follow', '550e8400-e29b-41d4-a716-446655440000', false),

('5a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'New Comment', 'Someone commented on your AI Learning Assistant project.', 'comment', '0a0e8400-e29b-41d4-a716-446655440003', false),

('5a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Challenge Participation', 'New participant joined your Sustainable Tech Challenge!', 'challenge', '950e8400-e29b-41d4-a716-446655440001', true);

-- ==========================================
-- SAMPLE BOOKMARKS
-- ==========================================

INSERT INTO public.bookmarks (id, user_id, project_id, idea_id) VALUES
('6a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NULL),
('6a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', NULL),
('6a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', NULL, '750e8400-e29b-41d4-a716-446655440000'),
('6a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', NULL),
('6a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', NULL, '750e8400-e29b-41d4-a716-446655440001');

-- ==========================================
-- SAMPLE USER SKILLS
-- ==========================================

INSERT INTO public.user_skills (id, user_id, skill_name, proficiency_level, years_experience, is_verified) VALUES
('7a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Solidity', 'expert', 4, true),
('7a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'React', 'expert', 6, true),
('7a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'UI/UX Design', 'expert', 8, true),
('7a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Figma', 'expert', 5, true),
('7a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Project Management', 'advanced', 7, false),
('7a0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Blockchain Architecture', 'expert', 5, true),
('7a0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'Machine Learning', 'expert', 6, true),
('7a0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'Python', 'expert', 8, true);

-- ==========================================
-- SAMPLE PROJECT COLLABORATORS
-- ==========================================

INSERT INTO public.project_collaborators (id, project_id, user_id, role, status, permissions) VALUES
('8a0e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'frontend_developer', 'accepted', ARRAY['view', 'edit', 'comment']),
('8a0e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'smart_contract_auditor', 'accepted', ARRAY['view', 'comment', 'review']),
('8a0e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'blockchain_consultant', 'pending', ARRAY['view', 'comment']),
('8a0e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'technical_advisor', 'accepted', ARRAY['view', 'edit', 'comment']);

-- ==========================================
-- SAMPLE ANALYTICS EVENTS
-- ==========================================

INSERT INTO public.analytics_events (id, user_id, event_type, event_data, project_id) VALUES
('9a0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'project_view', '{"source": "search", "duration": 45}', '650e8400-e29b-41d4-a716-446655440000'),
('9a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'project_like', '{"action": "like"}', '650e8400-e29b-41d4-a716-446655440000'),
('9a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'contribution_made', '{"amount": 5000, "type": "funding"}', '650e8400-e29b-41d4-a716-446655440001'),
('9a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'idea_vote', '{"vote_type": "upvote"}', NULL),
('9a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'project_share', '{"platform": "twitter"}', '650e8400-e29b-41d4-a716-446655440002');

-- ==========================================
-- SAMPLE USER SESSIONS
-- ==========================================

INSERT INTO public.user_sessions (id, user_id, session_duration, pages_visited, actions_performed, referrer) VALUES
('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 1800, 12, 8, 'google.com'),
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2400, 15, 12, 'twitter.com'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1200, 8, 5, 'direct'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 3600, 25, 18, 'github.com'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 2100, 16, 11, 'linkedin.com');

-- ==========================================
-- SAMPLE BLOCKCHAIN TRANSACTIONS
-- ==========================================

INSERT INTO public.blockchain_transactions (id, transaction_hash, from_address, to_address, amount, gas_used, gas_price, status, project_id, user_id) VALUES
('ba0e8400-e29b-41d4-a716-446655440000', '0x1234567890abcdef1234567890abcdef12345678', '0xabcd1234567890abcdef1234567890abcdef1234', '0xefgh5678901234efgh5678901234efgh56789012', 5000.00, 21000, 20000000000, 'confirmed', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),

('ba0e8400-e29b-41d4-a716-446655440001', '0x2345678901bcdef12345678901bcdef123456789', '0xbcde2345678901bcde2345678901bcde23456789', '0xfghi6789012345fghi6789012345fghi67890123', 10000.00, 23000, 22000000000, 'confirmed', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002');

-- ==========================================
-- SAMPLE IPFS STORAGE
-- ==========================================

INSERT INTO public.ipfs_storage (id, ipfs_hash, filename, file_size, mime_type, uploaded_by, project_id, is_public, metadata) VALUES
('ca0e8400-e29b-41d4-a716-446655440000', 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o', 'project_whitepaper.pdf', 2048576, 'application/pdf', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', true, '{"description": "Technical whitepaper for DeFi lending platform", "version": "1.0"}'),

('ca0e8400-e29b-41d4-a716-446655440001', 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51', 'smart_contract_audit.pdf', 1536000, 'application/pdf', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440000', true, '{"description": "Security audit report", "auditor": "CertiK"}');

-- ==========================================
-- UPDATE STATISTICS
-- ==========================================

-- Update user statistics based on sample data
UPDATE public.users SET 
    total_contributions = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.contributions 
        WHERE contributor_id = users.id
    ),
    total_projects = (
        SELECT COUNT(*) 
        FROM public.projects 
        WHERE creator_id = users.id
    ),
    projects_count = (
        SELECT COUNT(*) 
        FROM public.projects 
        WHERE creator_id = users.id
    ),
    followers_count = (
        SELECT COUNT(*) 
        FROM public.user_followers 
        WHERE user_id = users.id
    ),
    following_count = (
        SELECT COUNT(*) 
        FROM public.follows 
        WHERE follower_id = users.id
    );

-- Update project statistics
UPDATE public.projects SET 
    likes_count = (
        SELECT COUNT(*) 
        FROM public.project_likes 
        WHERE project_id = projects.id
    ),
    comments_count = (
        SELECT COUNT(*) 
        FROM public.comments 
        WHERE project_id = projects.id
    ),
    contributions_count = (
        SELECT COUNT(*) 
        FROM public.contributions 
        WHERE project_id = projects.id
    );

-- Update idea statistics
UPDATE public.ideas SET 
    votes_count = (
        SELECT COUNT(*) 
        FROM public.votes 
        WHERE idea_id = ideas.id AND vote_type = 'upvote'
    ) - (
        SELECT COUNT(*) 
        FROM public.votes 
        WHERE idea_id = ideas.id AND vote_type = 'downvote'
    ),
    comments_count = (
        SELECT COUNT(*) 
        FROM public.comments 
        WHERE idea_id = ideas.id
    );

-- ==========================================
-- NOTES
-- ==========================================
-- 
-- This sample data provides:
-- 1. 5 diverse users with different skills and backgrounds
-- 2. 5 projects across different categories and stages
-- 3. 5 ideas with various themes and complexity levels
-- 4. Complete chat system with groups and direct messages
-- 5. Contributions, escrow, and milestone examples
-- 6. Social features: likes, follows, comments, bookmarks
-- 7. Analytics events and user sessions
-- 8. Blockchain transactions and IPFS storage examples
-- 9. Notifications and user interactions
-- 10. Skill verification and collaboration examples
-- 
-- Usage:
-- 1. Run this after executing the main schema file
-- 2. Run after RLS policies are in place
-- 3. Modify user IDs to match your Supabase Auth users
-- 4. Adjust amounts and dates as needed
-- 5. Add more data as required for testing
--
-- Security Notes:
-- 1. User IDs should match Supabase Auth user IDs in production
-- 2. Sensitive data (emails, etc.) should be anonymized in production
-- 3. Transaction hashes should be real in production
-- 4. IPFS hashes should point to actual files in production