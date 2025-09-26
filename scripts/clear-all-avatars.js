// Clear avatar_url for all users in the users table.
// Usage (non-interactive): node scripts/clear-all-avatars.js ALL YES
// This script reads credentials from environment variables or from the repo .env file.

const path = require('path');
// load .env if present
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch (e) {
  // ignore if dotenv not available
}

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];

  if (!(arg1 === 'ALL' && arg2 === 'YES')) {
    console.error('This script requires explicit confirmation. Usage: node scripts/clear-all-avatars.js ALL YES');
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase credentials not found in environment (.env). Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { global: { headers: { 'x-application-name': 'clear-all-avatars-script' } } });

  console.log('Counting users with avatars...');
  const { data: usersWithAv, error: countErr } = await supabase.from('users').select('id').not('avatar_url', 'is', null);
  if (countErr) {
    console.error('Failed to count users with avatar_url:', countErr);
    process.exit(1);
  }

  const count = (usersWithAv || []).length;
  console.log(`Found ${count} user(s) with avatar_url.`);

  if (count === 0) {
    console.log('Nothing to do. Exiting.');
    process.exit(0);
  }

  console.log('Clearing avatar_url for all users...');
  // Update and return ids of affected rows
  const { data: updated, error: updErr } = await supabase.from('users').update({ avatar_url: null }).not('avatar_url', 'is', null).select('id');
  if (updErr) {
    console.error('Failed to clear avatar_url:', updErr);
    process.exit(1);
  }

  console.log(`Successfully cleared avatar_url for ${ (updated||[]).length } users.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
