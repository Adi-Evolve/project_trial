// Safe script to clear avatar_url for a specific user in Supabase.
// Usage: node scripts/clear-avatar.js <user_id_or_wallet_address>
// This script will NOT run automatically; it requires the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// environment variables to be set in the environment where this is executed.

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/clear-avatar.js <user_id_or_wallet_address>');
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as environment variables.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Try to find by id
  let { data: user, error } = await supabase.from('users').select('*').eq('id', arg).single();

  if (error) {
    // Try wallet_address
    const res = await supabase.from('users').select('*').eq('wallet_address', arg).single();
    user = res.data;
    error = res.error;
  }

  if (error || !user) {
    console.error('User not found for', arg);
    process.exit(1);
  }

  console.log('Found user:', { id: user.id, email: user.email, wallet_address: user.wallet_address });
  console.log('Avatar URL before:', user.avatar_url);

  // Confirm
  // Use built-in readline for confirmation (avoids external deps)
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(`Are you sure you want to clear avatar_url for user ${user.id}? Type YES to confirm: `, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
  if (answer !== 'YES') {
    console.log('Aborted');
    process.exit(0);
  }

  const { error: updErr } = await supabase.from('users').update({ avatar_url: null }).eq('id', user.id);
  if (updErr) {
    console.error('Failed to clear avatar_url:', updErr);
    process.exit(1);
  }

  console.log('avatar_url cleared successfully for', user.id);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
