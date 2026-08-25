const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_NAME = 'mcontartesi/webpage-signage-runner';
const WIKI_GIT_URL = `https://github.com/${REPO_NAME}.wiki.git`;
const WIKI_DIR = path.join(__dirname, '..', 'wiki');
const TEMP_CLONE_DIR = path.join(__dirname, '..', '.wiki-publish-temp');

async function main() {
  console.log('🚀 Publishing documentation to GitHub Wiki...');

  if (!fs.existsSync(WIKI_DIR)) {
    console.error(`❌ Error: Wiki directory not found at ${WIKI_DIR}`);
    process.exit(1);
  }

  // Cleanup temp dir if exists
  if (fs.existsSync(TEMP_CLONE_DIR)) {
    fs.rmSync(TEMP_CLONE_DIR, { recursive: true, force: true });
  }

  try {
    console.log(`📡 Connecting to GitHub Wiki git repository (${WIKI_GIT_URL})...`);
    execSync(`git clone ${WIKI_GIT_URL} "${TEMP_CLONE_DIR}"`, { stdio: 'pipe' });
  } catch (err) {
    console.warn('\n⚠️  Could not clone wiki repository automatically.');
    console.warn('👉 Note: On GitHub, you must initialize the wiki first:');
    console.warn(`   1. Visit https://github.com/${REPO_NAME}/wiki`);
    console.warn('   2. Click "Create the first page" and click "Save page" (can be empty or "Home").');
    console.warn('   3. Run "npm run wiki:publish" again.\n');
    console.error('Git error output:', err.message);
    process.exit(1);
  }

  try {
    console.log('📋 Copying wiki pages...');
    const files = fs.readdirSync(WIKI_DIR);
    for (const file of files) {
      const srcFile = path.join(WIKI_DIR, file);
      const destFile = path.join(TEMP_CLONE_DIR, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`   + ${file}`);
      }
    }

    console.log('📦 Committing changes...');
    execSync('git add .', { cwd: TEMP_CLONE_DIR });
    
    // Check if there are changes
    const status = execSync('git status --porcelain', { cwd: TEMP_CLONE_DIR }).toString().trim();
    if (!status) {
      console.log('✨ Wiki is already up-to-date. No changes to push.');
      return;
    }

    execSync('git commit -m "Update documentation and wiki pages"', { cwd: TEMP_CLONE_DIR });
    console.log('⬆️  Pushing to GitHub Wiki...');
    execSync('git push origin master', { cwd: TEMP_CLONE_DIR, stdio: 'inherit' });
    console.log('✅ GitHub Wiki published successfully!');
    console.log(`🔗 View at: https://github.com/${REPO_NAME}/wiki`);
  } catch (err) {
    console.error('❌ Error updating wiki:', err.message);
    process.exit(1);
  } finally {
    if (fs.existsSync(TEMP_CLONE_DIR)) {
      fs.rmSync(TEMP_CLONE_DIR, { recursive: true, force: true });
    }
  }
}

main();
