-- Add milestone_check column to projects table
-- This column tracks oracle verification status for milestones

-- Add the milestone_check column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS milestone_check boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN projects.milestone_check IS 'Oracle verification status: false on creation/new milestone, true after oracle verification';

-- Update existing projects to have milestone_check = false
UPDATE projects SET milestone_check = false WHERE milestone_check IS NULL;

-- Create index for faster queries on milestone_check
CREATE INDEX IF NOT EXISTS idx_projects_milestone_check ON projects(milestone_check);

-- Optional: Add trigger to automatically set milestone_check to false when milestones are updated
-- This would require a separate milestones table, but for now we'll handle this in the application logic

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'milestone_check';