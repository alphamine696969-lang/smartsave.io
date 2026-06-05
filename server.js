// ═══════════════════════════════════════════════════════════
// SmartSave.io — Backend Server (Express + yt-dlp)
// Production-ready for Render (Linux Docker)
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { execFile, execFileSync, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// ══════════════════════════════════════════════════════
// Binary Paths — Linux-only (Render Docker)
// ══════════════════════════════════════════════════════

const IS_WINDOWS = process.platform === 'win32';

function findBinary(name, candidates) {
    // On Windows use 'where', on Linux/Mac use 'which'
    const whichCmd = IS_WINDOWS ? 'where' : 'which';
    try {
        const found = execFileSync(whichCmd, [name], { encoding: 'utf8' }).trim().split('\n')[0].trim();
        if (found && fs.existsSync(found)) return found;
    } catch { /* not in PATH */ }

    // Check all candidate paths
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    // Last resort: return name as-is and let OS resolve
    return name;
}

const YT_DLP_PATH = findBinary(IS_WINDOWS ? 'yt-dlp.exe' : 'yt-dlp', [
    path.join(__dirname, 'yt-dlp.exe'),      // Windows: project root
    path.join(__dirname, 'yt-dlp'),           // Linux: project root
    path.join(__dirname, 'bin', 'yt-dlp.exe'),
    path.join(__dirname, 'bin', 'yt-dlp'),
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    '/app/yt-dlp',
]);

const FFMPEG_PATH = findBinary(IS_WINDOWS ? 'ffmpeg.exe' : 'ffmpeg', [
    path.join(__dirname, 'ffmpeg.exe'),       // Windows: project root
    path.join(__dirname, 'ffmpeg'),
    path.join(__dirname, 'ffmpeg-bin', 'ffmpeg.exe'),
    path.join(__dirname, 'ffmpeg-bin', 'ffmpeg'),
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
]);

const FFMPEG_DIR = path.dirname(FFMPEG_PATH);

// ══════════════════════════════════════════════════════
// Cookies Support (bypass YouTube bot detection)
// ══════════════════════════════════════════════════════

const COOKIES_PATH = path.join(os.tmpdir(), 'yt-cookies.txt');

// Write cookies from env var to file (set YOUTUBE_COOKIES in Render env)
function setupCookies() {
    const cookiesEnv = process.env.YOUTUBE_COOKIES;
    if (cookiesEnv) {
        try {
            fs.writeFileSync(COOKIES_PATH, cookiesEnv, 'utf8');
            return true;
        } catch (err) {
            console.error('Failed to write cookies:', err.message);
        }
    }
    // Also check for a cookies.txt file in the app directory
    const localCookies = path.join(__dirname, 'cookies.txt');
    if (fs.existsSync(localCookies)) {
        return true;
    }
    return false;
}

// Build common yt-dlp args with cookies if available
function getCookieArgs() {
    if (fs.existsSync(COOKIES_PATH)) {
        return ['--cookies', COOKIES_PATH];
    }
    const localCookies = path.join(__dirname, 'cookies.txt');
    if (fs.existsSync(localCookies)) {
        return ['--cookies', localCookies];
    }
    return [];
}

// ══════════════════════════════════════════════════════
// Download Job Manager
// ══════════════════════════════════════════════════════

const downloadJobs = new Map();

// Clean up stale jobs every hour (skip in-progress jobs)
const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [jobId, job] of downloadJobs.entries()) {
        if (now - job.createdAt > 3600_000 && job.status !== 'processing') {
            try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch (err) {
                if (err.code !== 'ENOENT') console.error('Cleanup failed:', err.message);
            }
            downloadJobs.delete(jobId);
        }
    }
}, 3600_000);
cleanupInterval.unref();

// ══════════════════════════════════════════════════════
// Middleware
// ══════════════════════════════════════════════════════

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        /\.vercel\.app$/,
        /^https:\/\/([a-z0-9-]+\.)?smartsave\.io$/,
        /\.onrender\.com$/,
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// ── Rate Limiting ──
const requestCounts = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

// Clean up stale rate limit entries every 5 minutes
const rateLimitInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestCounts.entries()) {
        if (now - entry.start > RATE_WINDOW) {
            requestCounts.delete(ip);
        }
    }
}, 300_000);
rateLimitInterval.unref();

function rateLimit(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress;
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now - entry.start > RATE_WINDOW) {
        requestCounts.set(ip, { count: 1, start: now });
        return next();
    }
    if (entry.count >= RATE_LIMIT) {
        return res.status(429).json({
            error: 'Too many requests. Please wait a moment.',
            retryAfter: Math.ceil((entry.start + RATE_WINDOW - now) / 1000)
        });
    }
    entry.count++;
    next();
}

// ── URL Validation ──
function isValidUrl(str) {
    try {
        const url = new URL(str);
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
}

// ══════════════════════════════════════════════════════
// Binary Self-Test
// ══════════════════════════════════════════════════════

let ytDlpVersion = null;
let ffmpegVersion = null;

function testBinary(name, binaryPath, versionArg = '--version') {
    if (!fs.existsSync(binaryPath)) {
        console.error(`  ❌  ${name} NOT FOUND at: ${binaryPath}`);
        return null;
    }
    try {
        const output = execFileSync(binaryPath, [versionArg], {
            encoding: 'utf8',
            timeout: 15000
        });
        const version = output.trim().split('\n')[0];
        console.log(`  ✅  ${name} → ${version}`);
        return version;
    } catch (err) {
        console.error(`  ⚠️  ${name} found but FAILED to run: ${err.message}`);
        return null;
    }
}

function checkYtDlp() {
    return ytDlpVersion !== null;
}

// ═════════════════════════════════════════════════════════
// YouTube Multi-Client Retry Helper
// ═════════════════════════════════════════════════════════

const YOUTUBE_CLIENTS = ['web', 'ios', 'android', 'mweb', 'tv_embedded'];
const YOUTUBE_RETRY_CLIENTS = ['ios', 'android', 'mweb', 'tv_embedded', 'web'];
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function isYouTubeUrl(url) {
    const l = url.toLowerCase();
    return l.includes('youtube') || l.includes('youtu.be');
}

// ═════════════════════════════════════════════════════════
// API: Get Media Info
// ═════════════════════════════════════════════════════════

app.post('/api/info', rateLimit, async (req, res) => {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Please provide a valid URL.' });
    }
    if (!checkYtDlp()) {
        return res.status(500).json({ error: 'Server not configured. yt-dlp binary is missing.' });
    }

    // --dump-json fetches metadata ONLY. NEVER pass -f here — that causes "format not available" errors.
    const baseArgs = [
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificate',
        ...getCookieArgs(),
    ];

    const isYT = isYouTubeUrl(url);
    // Try 'web' first (fastest path based on observed behavior), then fallbacks
    const clients = isYT ? ['web', 'ios', 'android', 'tv_embedded'] : [null];

    let info = null;
    let lastErr = null;

    for (const client of clients) {
        const args = [
            ...baseArgs,
            ...(client ? ['--extractor-args', `youtube:player_client=${client}`, '--user-agent', BROWSER_UA, '--geo-bypass'] : []),
            url,
        ];

        try {
            const { stdout } = await execFileAsync(YT_DLP_PATH, args, {
                timeout: 25_000,
                maxBuffer: 20 * 1024 * 1024,
            });
            try {
                info = JSON.parse(stdout);
            } catch {
                lastErr = { stderr: 'Response too large or corrupt. Try a different URL.' };
                break;
            }
            break;
        } catch (err) {
            const stderr = (err.stderr || err.message || '').trim();
            lastErr = { originalError: err, stderr };
            const isBotBlock = stderr.includes('Sign in') || stderr.includes('login') || stderr.includes('bot') || stderr.includes('confirm') || stderr.includes('not available in your country');
            const isFormatError = stderr.includes('Requested format is not available') || stderr.includes('format is not available');
            const isTimeout = err.killed || stderr.includes('timeout') || stderr.includes('ETIMEDOUT');
            // Retry next client for bot blocks, format errors, or timeouts
            if (!isBotBlock && !isFormatError && !isTimeout) break;
        }
    }

    // If all clients failed, try once more without extractor args
    if (!info && isYT) {
        try {
            const { stdout } = await execFileAsync(YT_DLP_PATH, [...baseArgs, url], {
                timeout: 25_000,
                maxBuffer: 20 * 1024 * 1024,
            });
            try {
                info = JSON.parse(stdout);
            } catch { /* still bad */ }
        } catch (err) {
            lastErr = { originalError: err, stderr: (err.stderr || err.message || '').trim() };
        }
    }

    if (!info) {
        const stderr = (lastErr?.stderr || lastErr?.message || '').trim();
        const lastLine = stderr.split('\n').pop() || '';
        if (lastErr?.killed || stderr.includes('timeout') || stderr.includes('ETIMEDOUT')) {
            return res.status(408).json({ error: 'Request timed out. Please try again.' });
        }
        if (stderr.includes('Sign in') || stderr.includes('login') || stderr.includes('bot') || stderr.includes('confirm')) {
            return res.status(403).json({ error: 'YouTube is temporarily blocking our server. Please try again in a few minutes.' });
        }
        if (stderr.includes('Requested format is not available') || stderr.includes('format is not available')) {
            return res.status(500).json({ error: 'This video has restricted formats. Please try again in a few minutes — YouTube is limiting our server.' });
        }
        if (stderr.includes('Private video') || stderr.includes('private')) {
            return res.status(403).json({ error: 'This video is private and cannot be downloaded.' });
        }
        if (stderr.includes('unavailable') || stderr.includes('removed') || stderr.includes('was not found')) {
            return res.status(404).json({ error: 'Video not found — it may have been deleted or is unavailable.' });
        }
        if (stderr.includes('HTTP Error 429') || stderr.includes('Too Many Requests')) {
            return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
        }
        return res.status(500).json({
            error: lastLine || 'Could not fetch video information. Please try a different URL.'
        });
    }

    // ── Parse formats ──────────────────────────────────
    const videoFormats = [];
    const audioFormats = [];
    const seenHeights = new Set();
    const seenAudioKeys = new Set();

    for (const f of (info.formats || [])) {
        if (!f.format_id) continue;
        const hasVideo = f.vcodec && f.vcodec !== 'none';
        const hasAudio = f.acodec && f.acodec !== 'none';
        const size = f.filesize || f.filesize_approx || null;

        if (hasVideo) {
            const height = f.height || 0;
            if (height < 144) continue;
            if (seenHeights.has(height)) continue;
            seenHeights.add(height);
            // Video-only streams: attach best audio
            const formatId = hasAudio ? f.format_id : `${f.format_id}+bestaudio[ext=m4a]/bestaudio`;
            const fpsLabel = f.fps && f.fps > 30 ? ` ${f.fps}fps` : '';
            const ext = (f.ext || 'mp4').toUpperCase();
            videoFormats.push({
                type: 'video',
                format_id: formatId,
                ext: f.ext || 'mp4',
                quality: `${height}p${fpsLabel}`,
                height,
                fps: f.fps || null,
                filesize: size,
                label: `${ext} — ${height}p${fpsLabel}`,
                note: f.format_note || '',
                hasAudio: true,
            });
        } else if (hasAudio && !hasVideo) {
            const abr = Math.round(f.abr || f.tbr || 0);
            if (!abr) continue;
            const ext = f.ext || 'm4a';
            const key = `${abr}-${ext}`;
            if (seenAudioKeys.has(key)) continue;
            seenAudioKeys.add(key);
            audioFormats.push({
                type: 'audio',
                format_id: f.format_id,
                ext,
                quality: `${abr}kbps`,
                abr,
                filesize: size,
                label: `${ext.toUpperCase()} — ${abr}kbps`,
                note: f.format_note || '',
                hasAudio: true,
            });
        }
    }

    videoFormats.sort((a, b) => b.height - a.height);
    audioFormats.sort((a, b) => b.abr - a.abr);

    // Always prepend a guaranteed "best" option
    videoFormats.unshift({
        type: 'video',
        format_id: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
        ext: 'mp4',
        quality: 'Best',
        height: 9999,
        filesize: null,
        label: '⭐ Best Quality (auto)',
        note: 'Auto-selects highest resolution + best audio',
        hasAudio: true,
        isBest: true,
    });

    res.json({
        success: true,
        data: {
            title: info.title || 'Untitled',
            thumbnail: info.thumbnail || null,
            duration: info.duration || 0,
            uploader: info.uploader || info.channel || 'Unknown',
            platform: detectPlatform(url),
            width: info.width || null,
            height: info.height || null,
            videoFormats,
            audioFormats,
        }
    });
});

// ═════════════════════════════════════════════════════════
// API: Prepare Download (background job)
// ═════════════════════════════════════════════════════════


app.get('/api/prepare-download', rateLimit, (req, res) => {
    const { url, format_id } = req.query;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL.' });
    }
    if (!checkYtDlp()) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    const jobId = crypto.randomBytes(8).toString('hex');
    const tmpDir = path.join(os.tmpdir(), 'smartsave_' + jobId);
    fs.mkdirSync(tmpDir, { recursive: true });

    downloadJobs.set(jobId, {
        status: 'processing',
        createdAt: Date.now(),
        tmpDir,
        file: null,
        error: null
    });

    res.json({ success: true, jobId });

    // Run download with format + retry logic
    async function runDownload(formatStr, isRetry = false) {
        // Build base args common to all platforms
        const baseArgs = [
            '--no-warnings',
            '--no-playlist',
            '--no-check-certificate',
            '--merge-output-format', 'mp4',
            '--concurrent-fragments', '4',
            '--retries', '10',
            '--fragment-retries', '20',
            '--file-access-retries', '5',
            '--extractor-retries', '5',
            '--socket-timeout', '30',
            ...getCookieArgs(),
            '--ffmpeg-location', FFMPEG_DIR,
            '-o', path.join(tmpDir, '%(title)s.%(ext)s'),
        ];

        // Format selection — use what was requested, with smart fallback chain
        const formatArg = formatStr || 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best';

        // For YouTube: try multiple clients if needed
        if (isYouTubeUrl(url)) {
            const clients = isRetry ? YOUTUBE_RETRY_CLIENTS : YOUTUBE_CLIENTS;

            let lastErr = null;
            for (const client of clients) {
                const args = [
                    '-f', formatArg,
                    ...baseArgs,
                    '--extractor-args', `youtube:player_client=${client}`,
                    '--user-agent', BROWSER_UA,
                    '--geo-bypass',
                    url,
                ];

                try {
                    await new Promise((resolve, reject) => {
                        const ytdlp = spawn(YT_DLP_PATH, args, { stdio: ['ignore', 'ignore', 'pipe'] });
                        let stderrData = '';
                        ytdlp.stderr.on('data', d => { stderrData += d.toString(); });
                        const timer = setTimeout(() => { ytdlp.kill('SIGTERM'); }, 300_000);
                        ytdlp.on('close', code => {
                            clearTimeout(timer);
                            if (code === 0) return resolve(stderrData);
                            const err = new Error(`exit ${code}`);
                            err.stderr = stderrData;
                            reject(err);
                        });
                        ytdlp.on('error', err => { clearTimeout(timer); reject(err); });
                    });

                    // Success — pick the largest output file (most likely the actual download)
                    const job = downloadJobs.get(jobId);
                    if (!job) return;
                    const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith('.part') && !f.endsWith('.ytdl'));
                    if (files.length > 0) {
                        const mediaFiles = files.filter(f => /\.(mp4|mkv|webm|m4a|mp3|opus|mov)$/i.test(f));
                        const bestFile = mediaFiles.length > 0 ? mediaFiles[0] : files[0];
                        job.status = 'ready';
                        job.file = path.join(tmpDir, bestFile);
                    } else {
                        job.status = 'error';
                        job.error = 'Download completed but output file is missing.';
                    }
                    return; // Done

                } catch (err) {
                    const stderr = err.stderr || '';
                    const isBotError = stderr.includes('Sign in') || stderr.includes('bot') || stderr.includes('confirm') || stderr.includes('not available');
                    const isFormatError = stderr.includes('Requested format is not available') || stderr.includes('not available');
                    const isBlocked = stderr.includes('HTTP Error 403') || stderr.includes('Too Many Requests') || stderr.includes('429');

                    lastErr = err;

                    // On format error: immediately retry with best format
                    if (isFormatError && !isRetry) {
                        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
                        fs.mkdirSync(tmpDir, { recursive: true });
                        return runDownload('bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best', true);
                    }

                    // On 403/block errors: try next client
                    if (isBotError || isBlocked) {
                        continue;
                    }

                    // Non-bot error: don't try other clients
                    break;
                }
            }

            // All clients failed — if not already retried, do a full retry with best format
            if (!isRetry) {
                try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
                fs.mkdirSync(tmpDir, { recursive: true });
                return runDownload('bestvideo+bestaudio/best', true);
            }

            // All retries exhausted
            const job = downloadJobs.get(jobId);
            if (job) {
                const stderr = lastErr?.stderr || '';
                job.status = 'error';
                if (stderr.includes('Sign in') || stderr.includes('bot') || stderr.includes('confirm')) {
                    job.error = 'YouTube is blocking this download. Please try again in a few minutes or try a different video.';
                } else if (stderr.includes('HTTP Error 403') || stderr.includes('429')) {
                    job.error = 'YouTube rate-limited this request. Please wait a few minutes and try again.';
                } else {
                    job.error = 'Download failed. Please try a different quality or try again.';
                }
                try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
            }

        } else {
            // Non-YouTube: single attempt with geo-bypass
            const args = [
                '-f', formatArg,
                ...baseArgs,
                '--user-agent', BROWSER_UA,
                '--geo-bypass',
                url,
            ];

            const ytdlp = spawn(YT_DLP_PATH, args, { stdio: ['ignore', 'ignore', 'pipe'] });
            let stderrData = '';
            ytdlp.stderr.on('data', d => { stderrData += d.toString(); });
            const timer = setTimeout(() => { ytdlp.kill('SIGTERM'); }, 300_000);

            ytdlp.on('close', code => {
                clearTimeout(timer);
                const job = downloadJobs.get(jobId);
                if (!job) return;

                if (code === 0) {
                    const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith('.part') && !f.endsWith('.ytdl'));
                    if (files.length > 0) {
                        const mediaFiles = files.filter(f => /\.(mp4|mkv|webm|m4a|mp3|opus|mov)$/i.test(f));
                        const bestFile = mediaFiles.length > 0 ? mediaFiles[0] : files[0];
                        job.status = 'ready';
                        job.file = path.join(tmpDir, bestFile);
                    } else {
                        job.status = 'error';
                        job.error = 'No output file after download completed.';
                    }
                } else {
                    const isFormatError = stderrData.includes('Requested format is not available');
                    if (isFormatError && !isRetry) {
                        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
                        fs.mkdirSync(tmpDir, { recursive: true });
                        return runDownload('bestvideo+bestaudio/best', true);
                    }
                    job.status = 'error';
                    job.error = isFormatError
                        ? 'Requested format unavailable. Try a different quality.'
                        : 'Download failed. Please try again.';
                    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
                }
            });

            ytdlp.on('error', err => {
                clearTimeout(timer);
                const job = downloadJobs.get(jobId);
                if (job) { job.status = 'error'; job.error = err.message; }
            });
        }
    }

    runDownload(format_id || 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
});


// ═════════════════════════════════════════════════════════
// API: Download Status
// ═════════════════════════════════════════════════════════

app.get('/api/download-status', (req, res) => {
    const job = downloadJobs.get(req.query.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ status: job.status, error: job.error });
});

// ═════════════════════════════════════════════════════════
// API: Fetch Downloaded File
// ═════════════════════════════════════════════════════════

app.get('/api/download', (req, res) => {
    const job = downloadJobs.get(req.query.jobId);
    if (!job || job.status !== 'ready' || !job.file) {
        return res.status(400).json({ error: 'Download not ready.' });
    }

    const filename = path.basename(job.file).replace(/[<>:"|?*]/g, '_');
    let stat;
    try {
        stat = fs.statSync(job.file);
    } catch {
        downloadJobs.delete(req.query.jobId);
        try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch {}
        return res.status(404).json({ error: 'File no longer available.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(job.file);
    stream.pipe(res);

    let cleaned = false;
    function cleanup() {
        if (cleaned) return;
        cleaned = true;
        try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch {}
        downloadJobs.delete(req.query.jobId);
    }

    stream.on('end', cleanup);
    stream.on('error', cleanup);
    stream.on('close', cleanup);
});

// ═════════════════════════════════════════════════════════
// API: Health Check
// ═════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        ytDlpReady: ytDlpVersion !== null,
        ffmpegReady: ffmpegVersion !== null,
        ytDlpVersion: ytDlpVersion || 'NOT FOUND',
        ffmpegVersion: ffmpegVersion || 'NOT FOUND',
        timestamp: new Date().toISOString()
    });
});

// ═════════════════════════════════════════════════════════
// API: Quick Test (diagnose yt-dlp issues)
// ═════════════════════════════════════════════════════════

app.get('/api/test', rateLimit, async (req, res) => {
    const testUrl = req.query.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    if (!isValidUrl(testUrl)) {
        return res.status(400).json({ error: 'Invalid URL.' });
    }
    if (!checkYtDlp()) {
        return res.status(503).json({ error: 'yt-dlp binary not found.' });
    }
    try {
        const { stdout } = await execFileAsync(YT_DLP_PATH, [
            '--dump-json', '--no-download', '--no-warnings', '--no-playlist',
            ...getCookieArgs(),
            '--ffmpeg-location', FFMPEG_DIR,
            testUrl
        ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

        const info = JSON.parse(stdout);
        res.json({
            success: true,
            title: info.title,
            formats: (info.formats || []).length,
            duration: info.duration,
            message: 'yt-dlp is working correctly!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            killed: err.killed || false,
        });
    }
});

// ── Platform Detection ──
function detectPlatform(url) {
    const l = url.toLowerCase();
    if (l.includes('youtube') || l.includes('youtu.be')) return 'YouTube';
    if (l.includes('instagram')) return 'Instagram';
    if (l.includes('twitter') || l.includes('x.com')) return 'Twitter / X';
    if (l.includes('facebook') || l.includes('fb.')) return 'Facebook';
    if (l.includes('pinterest')) return 'Pinterest';
    if (l.includes('tiktok')) return 'TikTok';
    if (l.includes('reddit')) return 'Reddit';
    if (l.includes('vimeo')) return 'Vimeo';
    return 'Media';
}

// ══════════════════════════════════════════════════════
// Start Server
// ══════════════════════════════════════════════════════

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  🚀  SmartSave.io API — PORT ${PORT}`);
    console.log(`  🐧  ${os.platform()} | Node ${process.version}`);
    console.log('───────────────────────────────────────────────────');

    ytDlpVersion = testBinary('yt-dlp', YT_DLP_PATH, '--version');
    ffmpegVersion = testBinary('ffmpeg', FFMPEG_PATH, '-version');
    const hasCookies = setupCookies();

    if (!ytDlpVersion || !ffmpegVersion) {
        console.log('');
        console.log('  ⚠️  MISSING BINARIES — Downloads will fail!');
    }
    if (!hasCookies) {
        console.log('  ⚠️  No YouTube cookies — bot detection may block downloads.');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('');
});

// ── Graceful Shutdown ──
function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        for (const [, job] of downloadJobs) {
            try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch {}
        }
        downloadJobs.clear();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
