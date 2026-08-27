const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getWikiGitUrl() {
  try {
    const originUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    if (originUrl) {
      if (originUrl.endsWith('.git')) {
        return originUrl.replace(/\.git$/, '.wiki.git');
      }
      return `${originUrl}.wiki.git`;
    }
  } catch {
    // fallback
  }
  return 'https://github.com/mcontartesi/webpage-signage-runner.wiki.git';
}

const WIKI_GIT_URL = getWikiGitUrl();
const REPO_NAME = 'mcontartesi/webpage-signage-runner';
const WIKI_DIR = path.join(__dirname, '..', 'wiki');
const TEMP_CLONE_DIR = path.join(__dirname, '..', '.wiki-publish-temp');

async function main() {
  console.log('🚀 Publicando documentación en la Wiki de GitHub / Publishing to GitHub Wiki...');

  if (!fs.existsSync(WIKI_DIR)) {
    console.error(`❌ Error: Directorio de Wiki no encontrado en / Wiki directory not found at: ${WIKI_DIR}`);
    process.exit(1);
  }

  // Cleanup temp dir if exists
  if (fs.existsSync(TEMP_CLONE_DIR)) {
    fs.rmSync(TEMP_CLONE_DIR, { recursive: true, force: true });
  }

  let isNewRepo = false;
  try {
    console.log(`📡 Conectando al repositorio Git de la Wiki: ${WIKI_GIT_URL}...`);
    execSync(`git clone "${WIKI_GIT_URL}" "${TEMP_CLONE_DIR}"`, { stdio: 'pipe' });
  } catch (err) {
    console.log('ℹ️  El clon falló. Intentando inicialización directa del repositorio Git de la Wiki...');
    isNewRepo = true;
    fs.mkdirSync(TEMP_CLONE_DIR, { recursive: true });
    execSync('git init', { cwd: TEMP_CLONE_DIR });
    execSync(`git remote add origin "${WIKI_GIT_URL}"`, { cwd: TEMP_CLONE_DIR });
    execSync('git branch -M master', { cwd: TEMP_CLONE_DIR });
  }

  try {
    console.log('📋 Copiando páginas de documentación...');
    const files = fs.readdirSync(WIKI_DIR);
    for (const file of files) {
      const srcFile = path.join(WIKI_DIR, file);
      const destFile = path.join(TEMP_CLONE_DIR, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`   + ${file}`);
      }
    }

    console.log('📦 Creando commit...');
    execSync('git add .', { cwd: TEMP_CLONE_DIR });
    
    const status = execSync('git status --porcelain', { cwd: TEMP_CLONE_DIR }).toString().trim();
    if (!status) {
      console.log('✨ La Wiki ya está actualizada. No hay cambios pendientes.');
      return;
    }

    execSync('git commit -m "Update documentation, guides and sidebar navigation"', { cwd: TEMP_CLONE_DIR });
    console.log('⬆️  Subiendo cambios a la Wiki de GitHub...');
    execSync('git push origin master', { cwd: TEMP_CLONE_DIR, stdio: 'inherit' });
    console.log('✅ ¡Wiki de GitHub publicada con éxito!');
    console.log(`🔗 Ver en: https://github.com/${REPO_NAME}/wiki`);
  } catch (err) {
    console.error('\n❌ Error al actualizar la Wiki de GitHub:');
    if (err.message.includes('not found') || err.message.includes('Repository not found')) {
      console.warn('\n💡 Motivo: Por política interna de GitHub, el repositorio Git de la Wiki (*.wiki.git) permanece bloqueado hasta que se crea la primera página desde la interfaz web.');
      console.warn('👉 Para activarlo en 5 segundos:');
      console.warn(`   1. Abre en tu navegador: https://github.com/${REPO_NAME}/wiki`);
      console.warn('   2. Haz clic en el botón verde "Create the first page" (Crear la primera página).');
      console.warn('   3. Haz clic abajo en el botón verde "Save page" (Guardar página).');
      console.warn('   4. Vuelve a ejecutar este comando: npm run wiki:publish\n');
    } else {
      console.error(err.message);
    }
    process.exit(1);
  } finally {
    if (fs.existsSync(TEMP_CLONE_DIR)) {
      fs.rmSync(TEMP_CLONE_DIR, { recursive: true, force: true });
    }
  }
}

main();
