const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitHubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  try {
    const creds = execSync('echo protocol=https\nhost=github.com | git credential fill', {
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

  // Fetch latest release
  const releasesRes = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'node',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!releasesRes.ok) {
    console.error('Failed to get latest release:', releasesRes.status);
    process.exit(1);
  }

  const release = await releasesRes.json();
  const releaseId = release.id;
  console.log(`Targeting release ${release.tag_name} (ID: ${releaseId})`);

  const releaseDir = path.join(__dirname, '..', 'release');
  if (!fs.existsSync(releaseDir)) {
    console.error('Release directory not found. Run npm run dist first.');
    process.exit(1);
  }

  const files = fs.readdirSync(releaseDir).filter((f) => {
    return f.endsWith('.exe') || f.endsWith('.AppImage') || f.endsWith('.deb') || f.endsWith('.rpm') || f.endsWith('.blockmap') || f === 'latest.yml';
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
                resolve(JSON.parse(body));
              } else if (res.statusCode === 422) {
                console.log(`ℹ️ Asset ${fileName} already exists on this release.`);
                resolve(null);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${body}`));
              }
            });
          }
        );

        req.on('error', (err) => reject(err));
        stream.pipe(req);
      });
    } catch (err) {
      console.error(`❌ Error uploading ${fileName}:`, err.message);
    }
  }

  console.log('All release assets processed.');
}

main().catch(console.error);
