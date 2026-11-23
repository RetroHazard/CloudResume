// Turns the contribution heatmap (public/data/contributions.json — the same data
// the Skills page renders) into a 3D-printable skyline: a base plate carrying the
// 53-week × 7-day calendar, one column per day whose height encodes that day's
// contributions, with month labels along the back and a caption along the front.
//
//   node scripts/contributions-stl.mjs [options]
//
//   --input <path|url>   contributions JSON (default: public/data/contributions.json)
//   --out <path>         output STL (default: contributions-skyline.stl)
//   --scale <mode>       log | sqrt | linear | level (default: log — a one-off spike of
//                        hundreds would otherwise flatten every ordinary day)
//   --max-height <mm>    tallest column above the plate (default: 25)
//   --pitch <mm>         cell pitch (default: 3.4)  --gap <mm>  gap between columns (default: 0.6)
//   --label <text>       front caption (default: date range + total); --no-label / --no-months to omit
//
// The output is a single watertight, manifold solid. Rather than stacking boxes
// (which leaves overlapping or coplanar shells for the slicer to untangle), every
// feature is rasterised onto a rectilinear heightfield and meshed in one pass;
// walls are split at every neighbouring height so there are no T-junctions.
//
// Two-tone print: everything above the plate (columns + lettering) starts at the
// same Z, so a single filament change at Z = plate thickness gives a dark base
// with bright skyline — the same look as the on-site heatmap.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const DEFAULTS = {
    pitch: 3.4, // mm between cell centres
    gap: 0.6, // mm between neighbouring columns (≥ 1.5 nozzle widths keeps them separate)
    margin: 5, // mm of plate around the grid
    base: 3, // plate thickness
    maxHeight: 25, // tallest column above the plate
    minHeight: 1, // shortest non-zero column, so a single contribution is still visible
    scale: 'log',
    pixel: 0.6, // lettering pixel size (5×7 font → 4.2 mm cap height)
    textHeight: 0.8, // how far lettering stands proud of the plate
    months: true,
    label: undefined, // undefined → generated; null/'' → none
};

// ---------------------------------------------------------------------------
// 5×7 pixel font. Each glyph is 7 rows of 5 bits, MSB = leftmost pixel.

const FONT = {
    ' ': [0, 0, 0, 0, 0, 0, 0],
    0: [14, 17, 19, 21, 25, 17, 14],
    1: [4, 12, 4, 4, 4, 4, 14],
    2: [14, 17, 1, 2, 4, 8, 31],
    3: [31, 2, 4, 2, 1, 17, 14],
    4: [2, 6, 10, 18, 31, 2, 2],
    5: [31, 16, 30, 1, 1, 17, 14],
    6: [6, 8, 16, 30, 17, 17, 14],
    7: [31, 1, 2, 4, 8, 8, 8],
    8: [14, 17, 17, 14, 17, 17, 14],
    9: [14, 17, 17, 15, 1, 2, 12],
    A: [14, 17, 17, 31, 17, 17, 17],
    B: [30, 17, 17, 30, 17, 17, 30],
    C: [14, 17, 16, 16, 16, 17, 14],
    D: [28, 18, 17, 17, 17, 18, 28],
    E: [31, 16, 16, 30, 16, 16, 31],
    F: [31, 16, 16, 30, 16, 16, 16],
    G: [14, 17, 16, 23, 17, 17, 15],
    H: [17, 17, 17, 31, 17, 17, 17],
    I: [14, 4, 4, 4, 4, 4, 14],
    J: [7, 2, 2, 2, 2, 18, 12],
    K: [17, 18, 20, 24, 20, 18, 17],
    L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 21, 21, 17, 17, 17],
    N: [17, 17, 25, 21, 19, 17, 17],
    O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16],
    Q: [14, 17, 17, 17, 21, 18, 13],
    R: [30, 17, 17, 30, 20, 18, 17],
    S: [15, 16, 16, 14, 1, 1, 30],
    T: [31, 4, 4, 4, 4, 4, 4],
    U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 17, 10, 4],
    W: [17, 17, 17, 21, 21, 21, 10],
    X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 10, 4, 4, 4, 4],
    Z: [31, 1, 2, 4, 8, 16, 31],
    '-': [0, 0, 0, 31, 0, 0, 0],
    '–': [0, 0, 0, 31, 0, 0, 0],
    '.': [0, 0, 0, 0, 0, 12, 12],
    ',': [0, 0, 0, 0, 12, 4, 8],
    ':': [0, 12, 12, 0, 12, 12, 0],
    '·': [0, 0, 0, 12, 12, 0, 0],
    '/': [1, 1, 2, 4, 8, 16, 16],
    '+': [0, 4, 4, 31, 4, 4, 0],
    '@': [14, 17, 23, 21, 23, 16, 14],
    '#': [10, 10, 31, 10, 31, 10, 10],
    _: [0, 0, 0, 0, 0, 0, 31],
};
const GLYPH_ADVANCE = 6; // 5 px glyph + 1 px spacing

export const textWidth = (text, pixel) => Math.max(0, text.length * GLYPH_ADVANCE - 1) * pixel;

// Lettering as rectangles, one per horizontal run of lit pixels. `x, y` is the
// bottom-left corner; row 0 of the glyph is the top. Runs are inflated by a
// hair so pixels that touch only diagonally overlap instead of meeting at a
// single edge — that keeps the final mesh manifold.
export function textRects(text, x, y, pixel, height) {
    const eps = 0.03;
    const rects = [];
    [...text.toUpperCase()].forEach((ch, i) => {
        const glyph = FONT[ch] ?? FONT[' '];
        const gx = x + i * GLYPH_ADVANCE * pixel;
        glyph.forEach((bits, row) => {
            const y1 = y + (7 - row) * pixel;
            let col = 0;
            while (col < 5) {
                if (!(bits & (16 >> col))) {
                    col++;
                    continue;
                }
                const start = col;
                while (col < 5 && bits & (16 >> col)) col++;
                rects.push({
                    x0: gx + start * pixel - eps,
                    x1: gx + col * pixel + eps,
                    y0: y1 - pixel - eps,
                    y1: y1 + eps,
                    h: height,
                });
            }
        });
    });
    return rects;
}

// ---------------------------------------------------------------------------
// Layout: contributions → a list of axis-aligned rectangles with heights.
// X runs left→right through the weeks; Y runs front→back, with Sunday at the
// back so the model reads like the on-screen calendar when viewed from the front.

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const parse = (iso) => new Date(`${iso}T00:00:00Z`);

export function columnHeight(count, maxCount, o) {
    if (count <= 0 || maxCount <= 0) return 0;
    const span = o.maxHeight - o.minHeight;
    if (o.scale === 'level') {
        const level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
        return o.minHeight + (span * (level - 1)) / 3;
    }
    const t =
        o.scale === 'log'
            ? Math.log1p(count) / Math.log1p(maxCount)
            : o.scale === 'sqrt'
              ? Math.sqrt(count / maxCount)
              : count / maxCount;
    return o.minHeight + span * t;
}

export function defaultLabel(data) {
    const days = data.days;
    const fmt = (iso) => {
        const d = parse(iso);
        return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };
    const total = data.total ?? days.reduce((s, d) => s + d.count, 0);
    return `${fmt(days[0].date)} – ${fmt(days[days.length - 1].date)} · ${total.toLocaleString('en-US')} CONTRIBUTIONS`;
}

export function layout(data, options = {}) {
    const o = { ...DEFAULTS, ...options };
    const days = data.days ?? [];
    if (!days.length) throw new Error('No contribution days to model.');

    const lead = parse(days[0].date).getUTCDay();
    const weeks = Math.ceil((lead + days.length) / 7);
    const maxCount = Math.max(...days.map((d) => d.count));
    const bar = o.pitch - o.gap;
    if (bar <= 0) throw new Error('--gap must be smaller than --pitch.');

    const label = o.label === undefined ? defaultLabel(data) : o.label;
    const textRow = 7 * o.pixel;
    const front = label ? o.margin + textRow + o.margin * 0.6 : o.margin;
    const back = o.months ? o.margin * 0.6 + textRow + o.margin : o.margin;

    const gridW = weeks * o.pitch - o.gap;
    const gridD = 7 * o.pitch - o.gap;
    const width = Math.max(gridW + 2 * o.margin, label ? textWidth(label, o.pixel) + 2 * o.margin : 0);
    const depth = front + gridD + back;
    const gx = (width - gridW) / 2;
    const top = o.base;

    const rects = [{ x0: 0, x1: width, y0: 0, y1: depth, h: o.base }];

    days.forEach((d, i) => {
        const slot = lead + i;
        const week = Math.floor(slot / 7);
        const dow = slot % 7; // 0 = Sunday → back row
        const h = columnHeight(d.count, maxCount, o);
        if (h <= 0) return;
        const x0 = gx + week * o.pitch;
        const y0 = front + (6 - dow) * o.pitch;
        rects.push({ x0, x1: x0 + bar, y0, y1: y0 + bar, h: top + h });
    });

    if (o.months) {
        // A month label sits over the week in which that month's 1st falls,
        // matching the web heatmap. Skip one that would collide with its left neighbour.
        let lastEnd = -Infinity;
        days.forEach((d, i) => {
            const date = parse(d.date);
            if (date.getUTCDate() !== 1) return;
            const week = Math.floor((lead + i) / 7);
            const x = gx + week * o.pitch;
            const name = MONTHS[date.getUTCMonth()];
            if (x < lastEnd + o.pixel * 2 || x + textWidth(name, o.pixel) > width - o.margin / 2) return;
            rects.push(...textRects(name, x, front + gridD + o.margin * 0.6, o.pixel, top + o.textHeight));
            lastEnd = x + textWidth(name, o.pixel);
        });
    }

    if (label) {
        const x = (width - textWidth(label, o.pixel)) / 2;
        rects.push(...textRects(label, x, o.margin, o.pixel, top + o.textHeight));
    }

    return { rects, width, depth, weeks, maxCount, label, options: o };
}

// ---------------------------------------------------------------------------
// Heightfield mesher. Rasterises rectangles onto the grid formed by all their
// edges (height = max of covering rects), then emits tops, bottoms and walls.
// Every vertical wall edge is split at each height present around its corner,
// so adjacent faces always share whole edges (no T-junctions) and the result
// is closed and 2-manifold, provided no two cells touch only diagonally.

const uniq = (values) => {
    const sorted = values.map((v) => Math.round(v * 1e5) / 1e5).sort((a, b) => a - b);
    return sorted.filter((v, i) => i === 0 || v !== sorted[i - 1]);
};

function lowerBound(arr, v) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] < v) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

export function meshHeightfield(rects) {
    const xs = uniq(rects.flatMap((r) => [r.x0, r.x1]));
    const ys = uniq(rects.flatMap((r) => [r.y0, r.y1]));
    const nx = xs.length - 1;
    const ny = ys.length - 1;
    const H = new Float64Array(nx * ny);
    const round = (v) => Math.round(v * 1e5) / 1e5;
    for (const r of rects) {
        const i0 = lowerBound(xs, round(r.x0));
        const i1 = lowerBound(xs, round(r.x1));
        const j0 = lowerBound(ys, round(r.y0));
        const j1 = lowerBound(ys, round(r.y1));
        const z = round(r.h); // same precision as cornerZ, so chain bounds match exactly
        for (let i = i0; i < i1; i++) {
            for (let j = j0; j < j1; j++) {
                const k = i * ny + j;
                if (z > H[k]) H[k] = z;
            }
        }
    }
    const h = (i, j) => (i < 0 || j < 0 || i >= nx || j >= ny ? 0 : H[i * ny + j]);

    // Heights present around grid corner (i, j) — the cells (i-1..i, j-1..j).
    const cornerZ = (i, j) => uniq([0, h(i - 1, j - 1), h(i, j - 1), h(i - 1, j), h(i, j)]);
    const chain = (i, j, lo, hi) => cornerZ(i, j).filter((z) => z >= lo && z <= hi);

    const tris = [];
    const tri = (a, b, c) => tris.push([a, b, c]);
    const quad = (a, b, c, d) => {
        tri(a, b, c);
        tri(a, c, d);
    };

    // Zip two vertical chains (bottom→top) into a strip. `pa`/`pb` are the
    // (x, y) of each chain; triangles are wound so the normal points along
    // the right-hand rule of a → b → up.
    const wall = (pa, za, pb, zb) => {
        let i = 0;
        let j = 0;
        const A = (k) => [pa[0], pa[1], za[k]];
        const B = (k) => [pb[0], pb[1], zb[k]];
        while (i < za.length - 1 || j < zb.length - 1) {
            const advanceA = j >= zb.length - 1 || (i < za.length - 1 && za[i + 1] <= zb[j + 1]);
            if (advanceA) {
                tri(A(i), B(j), A(i + 1));
                i++;
            } else {
                tri(A(i), B(j), B(j + 1));
                j++;
            }
        }
    };

    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            const z = h(i, j);
            if (z <= 0) continue;
            const [x0, x1, y0, y1] = [xs[i], xs[i + 1], ys[j], ys[j + 1]];
            quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]);
            quad([x0, y0, 0], [x0, y1, 0], [x1, y1, 0], [x1, y0, 0]);
        }
    }

    // Walls on vertical grid lines x = xs[i], between cell (i-1, j) and (i, j).
    for (let i = 0; i <= nx; i++) {
        for (let j = 0; j < ny; j++) {
            const L = h(i - 1, j);
            const R = h(i, j);
            if (L === R) continue;
            const lo = Math.min(L, R);
            const hi = Math.max(L, R);
            const a = [xs[i], ys[j]];
            const b = [xs[i], ys[j + 1]];
            // Normal faces the lower side: −x when the right cell is taller.
            if (R > L) wall(b, chain(i, j + 1, lo, hi), a, chain(i, j, lo, hi));
            else wall(a, chain(i, j, lo, hi), b, chain(i, j + 1, lo, hi));
        }
    }

    // Walls on horizontal grid lines y = ys[j], between cell (i, j-1) and (i, j).
    for (let j = 0; j <= ny; j++) {
        for (let i = 0; i < nx; i++) {
            const F = h(i, j - 1);
            const K = h(i, j);
            if (F === K) continue;
            const lo = Math.min(F, K);
            const hi = Math.max(F, K);
            const a = [xs[i], ys[j]];
            const b = [xs[i + 1], ys[j]];
            // Normal faces the lower side: −y when the back cell is taller.
            if (K > F) wall(a, chain(i, j, lo, hi), b, chain(i + 1, j, lo, hi));
            else wall(b, chain(i + 1, j, lo, hi), a, chain(i, j, lo, hi));
        }
    }

    return tris;
}

// ---------------------------------------------------------------------------
// Binary STL.

export function toBinaryStl(tris, header = 'contribution skyline') {
    const buf = Buffer.alloc(84 + tris.length * 50);
    buf.write(header.slice(0, 80), 0, 'ascii');
    buf.writeUInt32LE(tris.length, 80);
    let o = 84;
    for (const [a, b, c] of tris) {
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        const len = Math.hypot(...n) || 1;
        for (const val of [...n.map((x) => x / len), ...a, ...b, ...c]) {
            buf.writeFloatLE(val, o);
            o += 4;
        }
        buf.writeUInt16LE(0, o);
        o += 2;
    }
    return buf;
}

export function buildSkyline(data, options = {}) {
    const plan = layout(data, options);
    const tris = meshHeightfield(plan.rects);
    return { ...plan, tris };
}

// ---------------------------------------------------------------------------
// CLI

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        const key = argv[i];
        if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
        const name = key.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (name === 'noLabel') args.label = null;
        else if (name === 'noMonths') args.months = false;
        else args[name] = argv[++i];
    }
    for (const k of ['pitch', 'gap', 'margin', 'base', 'maxHeight', 'minHeight', 'pixel', 'textHeight']) {
        if (args[k] !== undefined) args[k] = Number(args[k]);
    }
    if (args.scale && !['log', 'sqrt', 'linear', 'level'].includes(args.scale)) {
        throw new Error(`--scale must be log, sqrt, linear or level (got ${args.scale})`);
    }
    return args;
}

async function loadData(input) {
    if (/^https?:\/\//.test(input)) {
        const res = await fetch(input, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`${input}: HTTP ${res.status}`);
        return res.json();
    }
    return JSON.parse(await readFile(input, 'utf8'));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const here = dirname(fileURLToPath(import.meta.url));
    const {
        input = resolve(here, '../public/data/contributions.json'),
        out = 'contributions-skyline.stl',
        ...opts
    } = parseArgs(process.argv.slice(2));
    const data = await loadData(input);
    const model = buildSkyline(data, opts);
    await writeFile(out, toBinaryStl(model.tris));
    const o = model.options;
    const tallest = Math.max(...model.rects.map((r) => r.h));
    console.log(`Wrote ${out}`);
    console.log(`  ${model.weeks} weeks · ${data.days.length} days · peak ${model.maxCount}/day · ${o.scale} scale`);
    console.log(`  footprint ${model.width.toFixed(1)} × ${model.depth.toFixed(1)} mm, ${tallest.toFixed(1)} mm tall`);
    console.log(`  ${model.tris.length.toLocaleString('en-US')} triangles`);
    if (model.label) console.log(`  caption: "${model.label}"`);
    console.log(`  two-tone tip: filament change at Z = ${o.base} mm`);
}
