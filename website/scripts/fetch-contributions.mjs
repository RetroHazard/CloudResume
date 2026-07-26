// Generates public/data/contributions.json by merging the public GitHub
// contribution graphs of the accounts listed below into a single dataset.
//
// No token required: the contribution graphs are public. Private commit counts
// are included automatically for any account that has enabled
// "Settings → Contributions → Include private contributions on my profile"
// (the counts are anonymised — no repo names are exposed).
//
// Between deploys the data is kept live by the scheduled updateContributions
// Lambda (infrastructure/codebase/updateContributions.py), which rewrites the
// same object in S3. This script only seeds the deploy: the site is synced to
// S3 with --delete, so the build output must contain data/contributions.json
// or a deploy would remove the Lambda-maintained object.
//
// Runs in CI immediately before the production build. On any network/API error
// it leaves the committed file in place, so a GitHub/API hiccup never breaks a
// deploy — the site simply ships the last-known-good heatmap.

import { writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ACCOUNTS = ['RetroHazard', 'BitMEX-abracken'];

const OUT = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../public/data/contributions.json',
);

// Public, no-auth contributions API. It scrapes the public profile graph, so it
// reflects the same totals GitHub shows there — including private-with-toggle.
const api = (user) => `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`;

// Bucket a merged daily count into GitHub's 0–4 intensity scale.
const levelFor = (count) => (count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4);

async function fetchUser(user) {
    const res = await fetch(api(user), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${user}: HTTP ${res.status}`);
    const json = await res.json();
    return json.contributions ?? [];
}

try {
    const perUser = await Promise.all(ACCOUNTS.map(fetchUser));

    // Merge by date — sum the counts from every account for each day.
    const byDate = new Map();
    for (const list of perUser) {
        for (const { date, count } of list) {
            byDate.set(date, (byDate.get(date) || 0) + (count || 0));
        }
    }

    const days = [...byDate.entries()]
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([date, count]) => ({ date, count, level: levelFor(count) }));

    const total = days.reduce((sum, d) => sum + d.count, 0);
    const payload = { total, accounts: ACCOUNTS, updated: new Date().toISOString(), days };

    await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
    console.log(`contributions.json — ${total.toLocaleString()} contributions over ${days.length} days (${ACCOUNTS.join(' + ')})`);
} catch (err) {
    console.warn(`fetch-contributions: keeping existing file (${err.message})`);
    // Guarantee the file exists so the build never fails on a missing import.
    try {
        await access(OUT);
    } catch {
        await writeFile(OUT, JSON.stringify({ total: 0, accounts: ACCOUNTS, updated: null, days: [] }, null, 2) + '\n');
    }
    process.exit(0);
}
