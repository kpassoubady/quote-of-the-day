import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SCREENSHOT_DIR = path.join(ROOT, 'docs', 'screenshots');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:3000';
const FRAME_COUNT = Number(process.env.DEMO_FRAME_COUNT || 5);
const FRAME_DURATION = Number(process.env.DEMO_FRAME_DURATION || 1.2);

const OUTPUT_GIF = path.join(SCREENSHOT_DIR, 'quotes-transition.gif');
const OUTPUT_MP4 = path.join(SCREENSHOT_DIR, 'quotes-transition.mp4');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', ...options });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function waitForServerReady(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // Ignore temporary connection failures while booting.
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server was not ready at ${url} after ${timeoutMs}ms`);
}

async function isServerReachable(url) {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

function startServer() {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return server;
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.killed) {
    return;
  }
  serverProcess.kill('SIGTERM');
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function captureQuoteFrames() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 980 } });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#quote-text');
  await page.waitForFunction(() => {
    const text = document.querySelector('#quote-text')?.textContent?.trim() || '';
    return text.length > 0;
  });

  const pauseButton = page.locator('#toggle-pause-btn');
  if (await pauseButton.isVisible()) {
    await pauseButton.click({ force: true });
  }

  const seen = new Set();
  for (let i = 1; i <= FRAME_COUNT; i += 1) {
    let currentQuote = (await page.locator('#quote-text').innerText()).trim();

    if (i > 1) {
      let attempts = 0;
      while ((seen.has(currentQuote) || currentQuote.length === 0) && attempts < 12) {
        await page.locator('#next-btn').click({ force: true });
        await page.waitForTimeout(700);
        currentQuote = (await page.locator('#quote-text').innerText()).trim();
        attempts += 1;
      }
    }

    seen.add(currentQuote);
    const framePath = path.join(SCREENSHOT_DIR, `quote-step-${i}.png`);
    await page.locator('.status-card').screenshot({ path: framePath });
    console.log(`Captured frame ${i}: ${currentQuote}`);

    if (i < FRAME_COUNT) {
      await page.locator('#next-btn').click({ force: true });
      await page.waitForTimeout(700);
    }
  }

  await browser.close();
}

async function renderVideoAssets() {
  const concatFile = path.join(SCREENSHOT_DIR, 'quote-steps.txt');
  const paletteFile = path.join(SCREENSHOT_DIR, 'palette.png');

  const lines = [];
  for (let i = 1; i <= FRAME_COUNT; i += 1) {
    lines.push(`file 'quote-step-${i}.png'`);
    lines.push(`duration ${FRAME_DURATION}`);
  }
  lines.push(`file 'quote-step-${FRAME_COUNT}.png'`);

  await fs.writeFile(concatFile, `${lines.join('\n')}\n`, 'utf-8');

  await runCommand('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile,
    '-vf', 'scale=1200:-2:flags=lanczos,fps=24,format=yuv420p',
    '-movflags', '+faststart',
    OUTPUT_MP4,
  ]);

  await runCommand('ffmpeg', [
    '-y',
    '-i', OUTPUT_MP4,
    '-vf', 'fps=14,scale=960:-1:flags=lanczos,palettegen',
    paletteFile,
  ]);

  await runCommand('ffmpeg', [
    '-y',
    '-i', OUTPUT_MP4,
    '-i', paletteFile,
    '-lavfi', 'fps=14,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse',
    OUTPUT_GIF,
  ]);

  await fs.rm(concatFile, { force: true });
  await fs.rm(paletteFile, { force: true });

  console.log(`Generated: ${OUTPUT_MP4}`);
  console.log(`Generated: ${OUTPUT_GIF}`);
}

async function main() {
  let server;
  let startedLocalServer = false;
  try {
    const alreadyRunning = await isServerReachable(BASE_URL);
    if (!alreadyRunning) {
      server = startServer();
      startedLocalServer = true;
      await waitForServerReady(BASE_URL);
    }
    await captureQuoteFrames();
    await renderVideoAssets();
    console.log('Quote transition demo refreshed successfully.');
  } finally {
    if (startedLocalServer) {
      await stopServer(server);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
