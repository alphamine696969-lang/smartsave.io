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

function findBinary(name, candidates) {
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    // Fallback: look in PATH via 'which'
    try {
        return execFileSync('which', [name], { encoding: 'utf8' }).trim();
    } catch { /* not found */ }
    return candidates[0];
}

const YT_DLP_PATH = findBinary('yt-dlp', [
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    '/app/yt-dlp'
]);

const FFMPEG_PATH = findBinary('ffmpeg', [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg'
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
            console.log('  🍪  YouTube cookies loaded from env var');
            return true;
        } catch (err) {
            console.error('  ⚠️  Failed to write cookies:', err.message);
        }
    }
    // Also check for a cookies.txt file in the app directory
    const localCookies = path.join(__dirname, 'cookies.txt');
    if (fs.existsSync(localCookies)) {
        console.log('  🍪  YouTube cookies found at cookies.txt');
        return true;
    }
    console.log('  ℹ️   No YouTube cookies configured (set YOUTUBE_COOKIES env var for best results)');
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

// Clean up stale jobs every hour
setInterval(() => {
    const now = Date.now();
    for (const [jobId, job] of downloadJobs.entries()) {
        if (now - job.createdAt > 3600_000) {
            try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch { }
            downloadJobs.delete(jobId);
        }
    }
}, 3600_000);

// ══════════════════════════════════════════════════════
// Middleware
// ══════════════════════════════════════════════════════

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        /\.vercel\.app$/,
        /smartsave/,
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

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress;
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
        console.log(`  ✅  ${name} → ${binaryPath} (${version})`);
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

    try {
        const { stdout } = await execFileAsync(YT_DLP_PATH, [
            '--dump-json',
            '--no-download',
            '--no-warnings',
            '--no-playlist',
            ...getCookieArgs(),
            '--ffmpeg-location', FFMPEG_DIR,
            url
        ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

        const info = JSON.parse(stdout);

        const videoFormats = [];
        const audioFormats = [];
        const seenVideoHeights = new Set();
        const seenAudio = new Set();

        if (info.formats) {
            for (const f of info.formats) {
                if (!f.url) continue;
                const hasVideo = f.vcodec && f.vcodec !== 'none';
                const hasAudio = f.acodec && f.acodec !== 'none';
                const ext = (f.ext || 'mp4').toUpperCase();
                const size = f.filesize || f.filesize_approx || null;
                const note = f.format_note || '';

                if (hasVideo) {
                    const height = f.height || 0;
                    const key = `${height}p`;
                    if (!seenVideoHeights.has(key) && height > 0) {
                        seenVideoHeights.add(key);
                        videoFormats.push({
                            type: 'video',
                            format_id: hasAudio ? f.format_id : `${f.format_id}+bestaudio`,
                            ext: f.ext || 'mp4',
                            quality: key,
                            height,
                            fps: f.fps || null,
                            filesize: size,
                            label: `${ext} — ${key}${f.fps && f.fps > 30 ? ' ' + f.fps + 'fps' : ''}`,
                            note,
                            hasAudio: true
                        });
                    }
                } else if (hasAudio && !hasVideo) {
                    const abr = f.abr || f.tbr || 0;
                    const key = `audio-${Math.round(abr)}-${f.ext}`;
                    if (!seenAudio.has(key) && abr > 0) {
                        seenAudio.add(key);
                        audioFormats.push({
                            type: 'audio',
                            format_id: f.format_id,
                            ext: f.ext || 'mp3',
                            quality: `${Math.round(abr)}kbps`,
                            abr: Math.round(abr),
                            filesize: size,
                            label: `${ext} — ${Math.round(abr)}kbps`,
                            note,
                            hasAudio: true
                        });
                    }
                }
            }
        }

        videoFormats.sort((a, b) => b.height - a.height);
        audioFormats.sort((a, b) => b.abr - a.abr);

        // Insert "Best Quality" option at top
        videoFormats.unshift({
            type: 'video',
            format_id: 'bestvideo+bestaudio/best',
            ext: 'mp4',
            quality: 'Best',
            height: info.height || 9999,
            filesize: null,
            label: '🌟 Best Quality (auto-merged)',
            note: 'Highest video + audio combined',
            hasAudio: true,
            isBest: true
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
                audioFormats
            }
        });

    } catch (err) {
        const stderrMsg = err.stderr ? err.stderr.trim().split('\n').pop() : '';
        console.error('yt-dlp error:', err.message);
        if (stderrMsg) console.error('yt-dlp stderr:', stderrMsg);

        if (err.killed || err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
            return res.status(408).json({ error: 'Request timed out. The server may be under heavy load — please try again.' });
        }
        if (stderrMsg.includes('Unsupported URL') || (err.stderr && err.stderr.includes('Unsupported URL'))) {
            return res.status(400).json({ error: 'This URL is not supported.' });
        }
        if (stderrMsg.includes('Sign in') || stderrMsg.includes('login') || stderrMsg.includes('private')) {
            return res.status(403).json({ error: 'This content requires sign-in or is private.' });
        }
        if (stderrMsg.includes('HTTP Error 429') || stderrMsg.includes('Too Many Requests')) {
            return res.status(429).json({ error: 'Too many requests to the platform. Please wait a moment and try again.' });
        }
        res.status(500).json({
            error: stderrMsg || 'Could not process this URL. It may be unsupported or the content may be private.'
        });
    }
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
    console.log(`[Job ${jobId}] Starting: format=${format_id || 'best'}`);

    const args = [
        '-f', format_id || 'best',
        '--no-warnings',
        '--no-playlist',
        '--merge-output-format', 'mp4',
        ...getCookieArgs(),
        '--ffmpeg-location', FFMPEG_DIR,
        '-o', path.join(tmpDir, '%(title)s.%(ext)s'),
        url
    ];

    const ytdlp = spawn(YT_DLP_PATH, args);
    let stderrData = '';

    ytdlp.stderr.on('data', (d) => { stderrData += d.toString(); });

    ytdlp.on('close', (code) => {
        const job = downloadJobs.get(jobId);
        if (!job) return;

        if (code === 0) {
            const files = fs.readdirSync(tmpDir);
            if (files.length > 0) {
                job.status = 'ready';
                job.file = path.join(tmpDir, files[0]);
                console.log(`[Job ${jobId}] Done: ${files[0]}`);
            } else {
                job.status = 'error';
                job.error = 'No output file.';
            }
        } else {
            console.error(`[Job ${jobId}] Error: ${stderrData}`);
            job.status = 'error';
            job.error = 'Download failed.';
            try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
        }
    });

    ytdlp.on('error', (err) => {
        const job = downloadJobs.get(jobId);
        if (job) {
            job.status = 'error';
            job.error = err.message;
        }
    });
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
    const stat = fs.statSync(job.file);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(job.file);
    stream.pipe(res);

    stream.on('end', () => {
        try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch { }
        downloadJobs.delete(req.query.jobId);
    });

    stream.on('error', () => {
        try { fs.rmSync(job.tmpDir, { recursive: true, force: true }); } catch { }
        downloadJobs.delete(req.query.jobId);
    });
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
        ytDlpPath: YT_DLP_PATH,
        ffmpegPath: FFMPEG_PATH,
        platform: os.platform(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
});

// ═════════════════════════════════════════════════════════
// API: Quick Test (diagnose yt-dlp issues)
// ═════════════════════════════════════════════════════════

app.get('/api/test', async (req, res) => {
    const testUrl = req.query.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    if (!checkYtDlp()) {
        return res.json({ error: 'yt-dlp binary not found', ytDlpPath: YT_DLP_PATH });
    }
    try {
        const { stdout, stderr } = await execFileAsync(YT_DLP_PATH, [
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
        res.json({
            success: false,
            error: err.message,
            stderr: err.stderr || null,
            killed: err.killed || false,
            code: err.code || null
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

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  🚀  SmartSave.io API — PORT ${PORT}`);
    console.log(`  🐧  ${os.platform()} | Node ${process.version}`);
    console.log('───────────────────────────────────────────────────');

    ytDlpVersion = testBinary('yt-dlp', YT_DLP_PATH, '--version');
    ffmpegVersion = testBinary('ffmpeg', FFMPEG_PATH, '-version');
    setupCookies();

    if (!ytDlpVersion || !ffmpegVersion) {
        console.log('');
        console.log('  ⚠️  MISSING BINARIES — Downloads will fail!');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('');
});

