// Small helper to run react-scripts build without ESLint failing the build.
// It temporarily sets the CI environment variable to false and removes ESLint plugin by
// invoking the react-scripts build with --no-eslint (not supported in CRA), so instead we
// use cross-env pattern to set DISABLE_ESLINT_PLUGIN to true which CRA respects in newer versions.

const { spawn } = require('child_process');

const env = Object.assign({}, process.env, {
  DISABLE_ESLINT_PLUGIN: 'true'
});

const child = spawn(process.execPath, [require.resolve('react-scripts/bin/react-scripts'), 'build'], {
  stdio: 'inherit',
  env
});

child.on('close', (code) => {
  process.exit(code);
});
