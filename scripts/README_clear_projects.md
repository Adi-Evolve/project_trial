scripts/clear-projects.js
==========================

Purpose
-------
Safe helper script to remove all projects and related funding rows from a Supabase database. Use this when you want to start the platform with a clean set of projects.

Important safety notes
----------------------
- This script performs destructive deletes. Back up your database before running.
- It expects environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY
- The script refuses to run against known demo URLs unless `--yes` is provided.
- Use `--dry-run` to see counts without deleting.

Usage
-----
From the repo root:

```powershell
# Dry run - shows counts only
$env:SUPABASE_URL='https://your-project.supabase.co'; $env:SUPABASE_SERVICE_KEY='your-service-key'; node scripts/clear-projects.js --dry-run

# Actual delete (interactive confirmation)
$env:SUPABASE_URL='https://your-project.supabase.co'; $env:SUPABASE_SERVICE_KEY='your-service-key'; node scripts/clear-projects.js

# Non-interactive (dangerous) - confirms automatically
$env:SUPABASE_URL='https://your-project.supabase.co'; $env:SUPABASE_SERVICE_KEY='your-service-key'; node scripts/clear-projects.js --yes
```

If you need a server-side one-off instead, consider running these commands in the Supabase SQL editor or using the Supabase CLI.
