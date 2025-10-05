-- SUPABASE SCHEMA: ProjectForge
-- This file contains the full schema for your platform. Append new migrations at the end.

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    github_username text,
    name text,
    avatar_url text,
    bio text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    long_description text,
    category text,
    tags text[],
    demo_url text,
    video_url text,
    image_urls text[],
    technologies text[],
    features text[],
    roadmap jsonb,
    funding_goal numeric,
    deadline timestamptz,
    team_size int,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- MILESTONES TABLE
CREATE TABLE IF NOT EXISTS milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_amount numeric,
    deadline timestamptz,
    deliverables jsonb,
    created_at timestamptz DEFAULT now()
);

-- IDEAS TABLE (for testnet posting)
CREATE TABLE IF NOT EXISTS ideas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    posted_to_testnet boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Add future migrations below this line, do not delete previous statements.
