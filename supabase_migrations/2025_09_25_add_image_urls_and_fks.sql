-- Migration: Add image_urls (text[]) to projects, migrate image_url -> image_urls,
-- add last_oracle_verification (jsonb) to projects, and create FK from contributions.contributor_id -> users.id
-- Run this in Supabase SQL editor or psql connected to your database.
-- This migration is written defensively so it can be run multiple times without error.

BEGIN;

-- 1) Add image_urls column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN image_urls text[];
  END IF;
END$$;

-- 2) If there is an existing single image_url column, migrate non-null values into the array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'image_url'
  ) THEN
    -- Update rows where image_url is present and image_urls is NULL
    UPDATE public.projects
    SET image_urls = ARRAY[image_url]
    WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls,1) = 0);

    -- NOTE: we intentionally DO NOT DROP image_url in this migration to allow easy rollback/validation.
    -- If you'd like to drop it once validated, run:
    -- ALTER TABLE public.projects DROP COLUMN IF EXISTS image_url;
  END IF;
END$$;

-- 3) Add last_oracle_verification jsonb column (for storing oracle metadata) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'last_oracle_verification'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN last_oracle_verification jsonb;
  END IF;
END$$;

-- 4) Add foreign key from contributions.contributor_id -> users.id if safe to do so
-- This will only add the FK when (a) the constraint doesn't already exist, (b) the column contributor_id exists and is uuid, and (c) all non-null contributor_id values map to existing users.id.
DO $$
DECLARE
  contributor_col_type text;
  constraint_exists int;
  orphan_count int;
BEGIN
  -- check if constraint already exists
  SELECT count(1) INTO constraint_exists
  FROM pg_constraint
  WHERE conname = 'contributions_contributor_id_fkey';

  IF constraint_exists > 0 THEN
    RAISE NOTICE 'Foreign key contributions_contributor_id_fkey already exists, skipping.';
    RETURN;
  END IF;

  -- confirm contributor_id column exists and its data type
  SELECT data_type INTO contributor_col_type
  FROM information_schema.columns
  WHERE table_name='contributions' AND column_name='contributor_id';

  IF contributor_col_type IS NULL THEN
    RAISE NOTICE 'contributions.contributor_id column not present, skipping FK creation.';
    RETURN;
  END IF;

  -- We only add FK if contributor_id is uuid (matches users.id common pattern). If your users.id is text, adjust accordingly.
  IF contributor_col_type <> 'uuid' THEN
    RAISE NOTICE 'contributions.contributor_id is % - not uuid; skipping FK creation. If you want an FK, ensure types align.', contributor_col_type;
    RETURN;
  END IF;

  -- Ensure no orphan contributor_ids exist
  EXECUTE '
    SELECT count(1) FROM contributions c
    LEFT JOIN users u ON c.contributor_id = u.id
    WHERE c.contributor_id IS NOT NULL AND u.id IS NULL
  ' INTO orphan_count;

  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % orphan contributor_id values. Resolve or set them to NULL before adding FK. Skipping FK creation.', orphan_count;
    RETURN;
  END IF;

  -- All checks passed; add FK (on delete set null to be safe)
  ALTER TABLE public.contributions
    ADD CONSTRAINT contributions_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.users(id) ON DELETE SET NULL;

  RAISE NOTICE 'Foreign key contributions_contributor_id_fkey created.';
END$$;

COMMIT;

-- Rollback notes:
--  - To remove the image_urls column: ALTER TABLE public.projects DROP COLUMN IF EXISTS image_urls;
--  - To restore image_url after a drop: you can set image_url = image_urls[1] where image_urls is not null.
--  - To remove FK: ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_contributor_id_fkey;
--  - To remove last_oracle_verification: ALTER TABLE public.projects DROP COLUMN IF EXISTS last_oracle_verification;

-- After running:
--  - Verify that projects.image_urls contains expected values for previously-set image_url rows.
--  - If you want to persist imgbb URLs, update your create/update project code to write into image_urls (text[]) and optionally set image_url for backwards compatibility.
--  - If your users.id type is not uuid (e.g., text), adjust the FK creation block accordingly (change the type check and reference).
