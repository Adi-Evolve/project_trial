-- Migration: add zkp_enabled to users and is_zkp to contributions (Option C)
-- Idempotent and defensive: checks for existing columns before altering

DO $$
BEGIN
  -- Add users.zkp_enabled boolean default false if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'zkp_enabled'
  ) THEN
    ALTER TABLE public.users ADD COLUMN zkp_enabled boolean DEFAULT false;
    COMMENT ON COLUMN public.users.zkp_enabled IS 'User preference to enable Zero-Knowledge privacy/anonymous contributions (Option C)';
  END IF;

  -- Add contributions.is_zkp boolean default false if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contributions' AND column_name = 'is_zkp'
  ) THEN
    ALTER TABLE public.contributions ADD COLUMN is_zkp boolean DEFAULT false;
    COMMENT ON COLUMN public.contributions.is_zkp IS 'Marks whether the contribution used a ZKP anonymous flow (Option C)';
  END IF;

  -- Optional: backfill contributions.is_zkp for existing anonymous contributions if you want
  -- UPDATE public.contributions SET is_zkp = true WHERE is_anonymous = true AND is_zkp IS NULL;

EXCEPTION WHEN others THEN
  -- Log and continue; migration should not fail hard in multi-tenant setups
  RAISE NOTICE 'Migration 2025_09_25_add_zkp_columns_option_c encountered an issue: %', SQLERRM;
END$$;
