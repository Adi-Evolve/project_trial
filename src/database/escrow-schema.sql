-- Escrow System Database Schema
-- Run this in Supabase SQL Editor

-- Table for project milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "targetAmount" NUMERIC(5,2) NOT NULL CHECK ("targetAmount" > 0 AND "targetAmount" <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'released')),
  "dueDate" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence TEXT,
  "reviewerComments" TEXT
);

-- Table for escrow releases
CREATE TABLE IF NOT EXISTS escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" TEXT NOT NULL,
  "milestoneId" TEXT NOT NULL,
  amount TEXT NOT NULL, -- Amount in ETH as string for precision
  "releaseType" TEXT NOT NULL CHECK ("releaseType" IN ('milestone', 'emergency', 'final')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'failed')),
  "requestedBy" TEXT NOT NULL,
  "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "transactionHash" TEXT,
  "executedAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones("projectId");
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_project_id ON escrow_releases("projectId");
CREATE INDEX IF NOT EXISTS idx_escrow_releases_status ON escrow_releases(status);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_milestone_id ON escrow_releases("milestoneId");

-- Row Level Security (RLS) policies
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_releases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_milestones
CREATE POLICY "Users can view milestones for projects they can access" 
ON project_milestones FOR SELECT 
USING (true); -- For now, allow all authenticated users to view

CREATE POLICY "Project creators can insert milestones" 
ON project_milestones FOR INSERT 
WITH CHECK (true); -- For now, allow all authenticated users to insert

CREATE POLICY "Project creators can update their milestones" 
ON project_milestones FOR UPDATE 
USING (true) -- For now, allow all authenticated users to update
WITH CHECK (true);

-- RLS Policies for escrow_releases
CREATE POLICY "Users can view releases for projects they can access" 
ON escrow_releases FOR SELECT 
USING (true); -- For now, allow all authenticated users to view

CREATE POLICY "Project creators can request releases" 
ON escrow_releases FOR INSERT 
WITH CHECK (true); -- For now, allow all authenticated users to insert

CREATE POLICY "Authorized users can update releases" 
ON escrow_releases FOR UPDATE 
USING (true) -- For now, allow all authenticated users to update
WITH CHECK (true);

-- Function to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updatedAt
CREATE TRIGGER update_project_milestones_updated_at 
BEFORE UPDATE ON project_milestones 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_releases_updated_at 
BEFORE UPDATE ON escrow_releases 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Views for easier querying
CREATE OR REPLACE VIEW project_escrow_summary AS
SELECT 
  m."projectId",
  COUNT(*) as total_milestones,
  COUNT(CASE WHEN m.status = 'released' THEN 1 END) as completed_milestones,
  COALESCE(SUM(CASE WHEN m.status = 'released' THEN m."targetAmount" ELSE 0 END), 0) as released_percentage,
  COALESCE(SUM(CASE WHEN er.status = 'executed' THEN CAST(er.amount AS NUMERIC) ELSE 0 END), 0) as total_released_eth
FROM project_milestones m
LEFT JOIN escrow_releases er ON m.id = er."milestoneId" AND er.status = 'executed'
GROUP BY m."projectId";

-- Comments for documentation
COMMENT ON TABLE project_milestones IS 'Stores milestone definitions for projects with escrow releases';
COMMENT ON TABLE escrow_releases IS 'Tracks fund release requests and executions for project milestones';
COMMENT ON VIEW project_escrow_summary IS 'Provides summary statistics for project escrow status';

-- Insert some example data for testing (optional)
-- INSERT INTO project_milestones ("projectId", title, description, "targetAmount", "dueDate") VALUES
-- ('test-project-1', 'Initial Development', 'Complete basic functionality', 40.00, NOW() + INTERVAL '30 days'),
-- ('test-project-1', 'Beta Testing', 'User testing and feedback incorporation', 30.00, NOW() + INTERVAL '60 days'),
-- ('test-project-1', 'Launch and Marketing', 'Product launch and marketing campaign', 30.00, NOW() + INTERVAL '90 days');