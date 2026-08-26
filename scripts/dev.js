const { spawn } = require('child_process');
const path = require('path');
const electronPath = require('electron');

const rootDir = path.resolve(__dirname, '..');

// First run build
const buildProc = spawn('node', [path.join(__dirname, 'build.js')], {
  stdio: 'inherit',
  cwd: rootDir,
});

buildProc.on('close', (code) => {
  if (code !== 0) {
    console.error('[Dev] Build failed.');
    process.exit(code);
  }

  console.log('[Dev] Starting Electron...');
  const electronProc = spawn(electronPath, ['.'], {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  const cleanExit = () => {
    if (electronProc && !electronProc.killed) {
      try {
        electronProc.kill('SIGINT');
      } catch {}
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);

  electronProc.on('close', () => {
    process.exit(0);
  });
});
