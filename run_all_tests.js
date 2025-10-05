// Script to run all test JS files in the project
// Usage: node run_all_tests.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testFiles = [
  'test-working-final.js',
  'test-user-operations.js',
  'test-transaction-operations.js',
  'test-supabase-connection.js',
  'test-pinata.js',
  'test-pinata-simple.js',
  'test-oracle-system.js',
  'test-fund-transfer.js',
  'test-fund-transfer-flow.js',
  'test-full-flow.js',
  'test-final-comprehensive.js',
  'test-error-handling.js',
  'test-enhanced-supabase.js',
  'test-enhanced-service.js',
  'test-create-save-oracle.js',
  'test-project-blockchain-save.js',
  'test-project-creation-display.js',
  'test-rls-policies.js',
  // Add more test files as needed
];

const cwd = __dirname;

for (const file of testFiles) {
  const filePath = path.join(cwd, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n=== Running ${file} ===`);
    try {
      execSync(`node "${filePath}"`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Test failed: ${file}`);
    }
  } else {
    console.warn(`Test file not found: ${file}`);
  }
}
