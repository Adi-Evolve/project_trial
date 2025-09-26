#!/usr/bin/env node
/*
  scripts/clear-projects.js
  Safe helper to remove all projects and related data from Supabase.
  Usage:
    node scripts/clear-projects.js --dry-run
    node scripts/clear-projects.js --yes

  IMPORTANT: Provide SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
  The script will refuse to run against the demo URL unless --yes is provided.
*/

const { createClient } = require('@supabase/supabase-js');
const argv = require('minimist')(process.argv.slice(2));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. Aborting.');
  process.exit(1);
}

if (SUPABASE_URL.includes('demo.supabase.co') && !argv.yes) {
  console.error('Refusing to run destructive operation against demo Supabase URL. Use --yes to override.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const dryRun = !!argv['dry-run'] || !!argv['dryrun'] || !!argv.dry;

async function countRows(table) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

async function run() {
  try {
    console.log('Dry run:', dryRun);

    // Order matters due to FKs: donations -> transactions -> contributions (or similar), projects etc.
    const tables = [
      'donations',
      'transactions',
      'contributions',
      'project_analytics',
      'wallet_connections',
      'milestones',
      'projects'
    ];

    for (const t of tables) {
      try {
        const c = await countRows(t).catch(() => null);
        console.log(`${t}: ${c === null ? 'unknown (count failed)' : c}`);
      } catch (err) {
        console.warn(`Could not count rows for ${t}:`, err.message || err);
      }
    }

    if (dryRun) {
      console.log('\nDry-run mode enabled; no deletes performed.');
      return;
    }

    if (!argv.yes) {
      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise((res) => rl.question('\nAre you sure you want to DELETE ALL PROJECTS AND RELATED DATA? Type YES to confirm: ', ans => { rl.close(); res(ans); }));
      if (answer !== 'YES') {
        console.log('Aborted by user. No changes made.');
        process.exit(0);
      }
    }

    // Delete operations in safe order
    for (const t of tables) {
      try {
        console.log(`Deleting rows from ${t} ...`);
        const { error } = await supabase.from(t).delete().neq('id', '');
        if (error) {
          console.warn(`Delete failed for ${t}:`, error.message || error);
        } else {
          console.log(`Deleted from ${t}`);
        }
      } catch (err) {
        console.warn(`Error deleting from ${t}:`, err.message || err);
      }
    }

    console.log('\nCompleted deletion pass. It may take a moment for related triggers and analytics to update.');
  } catch (err) {
    console.error('Script error:', err.message || err);
    process.exit(1);
  }
}

run();
