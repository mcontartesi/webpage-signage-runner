const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyStaticFiles() {
  const srcRendererDir = path.join(rootDir, 'src', 'renderer');
  const distRendererDir = path.join(distDir, 'renderer');
  ensureDir(distRendererDir);

  if (fs.existsSync(srcRendererDir)) {
    const files = fs.readdirSync(srcRendererDir);
    for (const file of files) {
      if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.svg') || file.endsWith('.png')) {
        fs.copyFileSync(
          path.join(srcRendererDir, file),
          path.join(distRendererDir, file)
        );
      }
    }
  }

  const srcAssetsDir = path.join(rootDir, 'assets');
  const distAssetsDir = path.join(distDir, 'assets');
  ensureDir(distAssetsDir);

  if (fs.existsSync(srcAssetsDir)) {
    const assetFiles = fs.readdirSync(srcAssetsDir);
    for (const file of assetFiles) {
      fs.copyFileSync(
        path.join(srcAssetsDir, file),
        path.join(distAssetsDir, file)
      );
    }
  }
}

async function build() {
  ensureDir(distDir);
  copyStaticFiles();

  // 1. Build Main Process
  const mainContext = await esbuild.context({
    entryPoints: [path.join(rootDir, 'src', 'main', 'index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: path.join(distDir, 'main', 'index.js'),
    external: ['electron'],
    sourcemap: !isProd,
    minify: isProd,
    logLevel: 'info',
  });

  // 2. Build Preload Scripts
  const preloadContext = await esbuild.context({
    entryPoints: [path.join(rootDir, 'src', 'preload', 'index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: path.join(distDir, 'preload', 'index.js'),
    external: ['electron'],
    sourcemap: !isProd,
    minify: isProd,
    logLevel: 'info',
  });

  // 3. Build Renderer Scripts (setup.ts, offline.ts, etc.)
  const rendererFiles = ['setup.ts', 'offline.ts'];
  const existingRendererEntries = rendererFiles
    .map(f => path.join(rootDir, 'src', 'renderer', f))
    .filter(f => fs.existsSync(f));

  let rendererContext = null;
  if (existingRendererEntries.length > 0) {
    rendererContext = await esbuild.context({
      entryPoints: existingRendererEntries,
      bundle: true,
      platform: 'browser',
      target: 'chrome120',
      format: 'iife',
      outdir: path.join(distDir, 'renderer'),
      sourcemap: !isProd,
      minify: isProd,
      logLevel: 'info',
    });
  }

  if (isWatch) {
    console.log('[Build] Watching for changes...');
    await mainContext.watch();
    await preloadContext.watch();
    if (rendererContext) await rendererContext.watch();

    // Watch for static file changes in renderer and assets
    fs.watch(path.join(rootDir, 'src', 'renderer'), (eventType, filename) => {
      if (filename && (filename.endsWith('.html') || filename.endsWith('.css'))) {
        copyStaticFiles();
        console.log(`[Build] Updated static file: ${filename}`);
      }
    });
  } else {
    await mainContext.rebuild();
    await preloadContext.rebuild();
    if (rendererContext) await rendererContext.rebuild();
    await mainContext.dispose();
    await preloadContext.dispose();
    if (rendererContext) await rendererContext.dispose();
    console.log('[Build] Compilation completed successfully.');
  }
}

build().catch((err) => {
  console.error('[Build Error]', err);
  process.exit(1);
});
