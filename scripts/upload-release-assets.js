const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitHubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = creds.match(/password=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {}

  return null;
}

const REPO = 'mcontartesi/webpage-signage-runner';

async function main() {
  const token = getGitHubToken();
  if (!token) {
    console.error('Error: No GitHub token found in env (GH_TOKEN/GITHUB_TOKEN) or git credentials.');
    process.exit(1);
  }

  const pkg = require('../package.json');
  const version = pkg.version;
  const tagName = `v${version}`;

  // Check if release exists for current tag, or create it
  let release;
  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${tagName}`, {
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'node',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (getReleaseRes.ok) {
    release = await getReleaseRes.json();
    console.log(`Found existing release for ${tagName} (ID: ${release.id})`);
  } else if (getReleaseRes.status === 404) {
    console.log(`Release ${tagName} does not exist yet. Creating release...`);
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'node',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        tag_name: tagName,
        target_commitish: 'main',
        name: `Release ${tagName}`,
        body: `## Webpage Signage Runner ${tagName}

### Bug Fixes & Improvements
- **Windows Reboot Config Persistence**: Fixed issue where display settings reverted to defaults upon Windows restart by adding multi-tier smart display matching (ID, screen index, primary flag, bounds).
- **Application Exit Shortcuts**: Added support for closing the app using \`Ctrl + C\`, \`Ctrl + Q\`, and an **Exit App** button in the Setup Wizard.
- **Process Resilience**: Clean signal handling (\`SIGINT\`, \`SIGTERM\`) to prevent orphaned background processes.
`,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error(`Failed to create release: HTTP ${createRes.status} - ${errBody}`);
      process.exit(1);
    }
    release = await createRes.json();
    console.log(`Created release ${tagName} (ID: ${release.id})`);
  } else {
    console.error('Failed to check release:', getReleaseRes.status);
    process.exit(1);
  }

  const releaseId = release.id;
  console.log(`Targeting release ${release.tag_name} (ID: ${releaseId})`);

  const releaseDir = path.join(__dirname, '..', 'release');
  if (!fs.existsSync(releaseDir)) {
    console.error('Release directory not found. Run npm run dist first.');
    process.exit(1);
  }

  const files = fs.readdirSync(releaseDir).filter((f) => {
    if (f === 'latest.yml' || f === 'latest-linux.yml') return true;
    return (
      f.includes(version) &&
      (f.endsWith('.exe') ||
        f.endsWith('.AppImage') ||
        f.endsWith('.deb') ||
        f.endsWith('.rpm') ||
        f.endsWith('.blockmap') ||
        f.endsWith('.tar.gz'))
    );
  });

  for (const fileName of files) {
    const filePath = path.join(releaseDir, fileName);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`Uploading ${fileName} (${sizeMB} MB)...`);

    const url = `https://uploads.github.com/repos/${REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(fileName)}`;

    try {
      await new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const req = https.request(
          url,
          {
            method: 'POST',
            headers: {
              Authorization: `token ${token}`,
              'User-Agent': 'node',
              'Content-Type': 'application/octet-stream',
              'Content-Length': stat.size,
            },
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`✅ Uploaded ${fileName} successfully (status: ${res.statusCode})`);
                resolve(null);
              } else if (res.statusCode === 422) {
                console.log(`ℹ️ Asset ${fileName} already exists on this release.`);
                resolve(null);
              } else {
                console.error(`❌ HTTP ${res.statusCode}: ${body}`);
                resolve(null);
              }
            });
          }
        );

        req.on('error', (err) => {
          console.error(`❌ Network error uploading ${fileName}:`, err.message);
          resolve(null);
        });

        stream.pipe(req);
      });
    } catch (err) {
      console.error(`❌ Error uploading ${fileName}:`, err.message);
    }
  }

  console.log('All release assets processed.');
}

main().catch(console.error);
