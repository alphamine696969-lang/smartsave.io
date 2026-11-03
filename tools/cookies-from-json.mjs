#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// SmartSave.io — Cookie converter (JSON export → Netscape)
//
// Browser extensions ("Get cookies.txt", "EditThisCookie", Cookie-Editor)
// export cookies as JSON. yt-dlp needs the Netscape format, so this converts
// and prints the base64 blob you can paste into the host's env vars.
//
// Usage:
//   node tools/cookies-from-json.mjs cookies.json
//   node tools/cookies-from-json.mjs cookies.json --out cookies.txt
//   node tools/cookies-from-json.mjs cookies.json --stdout   (Netscape only)
//
// Then on Render, set:
//   YOUTUBE_COOKIES_BASE64 = <the printed single-line value>
// ═══════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--'));
const outFlag = args.indexOf('--out');
const outPath = outFlag !== -1 ? args[outFlag + 1] : null;
const stdoutOnly = args.includes('--stdout');

if (!input) {
    console.error('Usage: node tools/cookies-from-json.mjs <cookies.json> [--out cookies.txt] [--stdout]');
    process.exit(1);
}

let cookies;
try {
    cookies = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch (err) {
    console.error(`Could not read/parse ${input}: ${err.message}`);
    process.exit(1);
}

if (!Array.isArray(cookies) || cookies.length === 0) {
    console.error('Expected a non-empty JSON array of cookie objects.');
    process.exit(1);
}

const lines = ['# Netscape HTTP Cookie File', ''];

for (const c of cookies) {
    if (!c || !c.name || !c.domain) continue;
    // HttpOnly cookies must be marked with the #HttpOnly_ prefix.
    const domain = (c.httpOnly ? '#HttpOnly_' : '') + c.domain;
    // Netscape "include subdomains" flag.
    const flag = c.hostOnly ? 'FALSE' : 'TRUE';
    const cookiePath = c.path || '/';
    const secure = c.secure ? 'TRUE' : 'FALSE';
    const expiry = c.session || !c.expirationDate ? 0 : Math.floor(c.expirationDate);
    lines.push([domain, flag, cookiePath, secure, expiry, c.name, c.value].join('\t'));
}

const text = lines.join('\n') + '\n';
const rows = lines.length - 2;

if (stdoutOnly) {
    process.stdout.write(text);
} else {
    if (outPath) {
        fs.writeFileSync(outPath, text, 'utf8');
    }
    const b64 = Buffer.from(text, 'utf8').toString('base64');
    console.log(`Converted ${rows} cookie(s).`);
    if (outPath) console.log(`Netscape file written to ${path.resolve(outPath)}`);
    console.log('\nSet this on your host (Render → Environment):');
    console.log('  YOUTUBE_COOKIES_BASE64=' + b64);
}
