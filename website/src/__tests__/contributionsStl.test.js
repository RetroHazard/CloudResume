// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    buildSkyline,
    columnHeight,
    DEFAULTS,
    layout,
    meshHeightfield,
    textRects,
    toBinaryStl,
} from '../../scripts/contributions-stl.mjs';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/contributions.json'), 'utf8'));

// A printable mesh must be closed and 2-manifold: every directed edge appears
// exactly once and is matched by its reverse on exactly one neighbouring face.
function edgeDefects(tris) {
    const key = (p) => p.map((v) => v.toFixed(5)).join(',');
    const edges = new Map();
    for (const t of tris) {
        for (let k = 0; k < 3; k++) {
            const e = `${key(t[k])}>${key(t[(k + 1) % 3])}`;
            edges.set(e, (edges.get(e) ?? 0) + 1);
        }
    }
    let defects = 0;
    for (const [e, n] of edges) {
        const [a, b] = e.split('>');
        if (n !== 1 || edges.get(`${b}>${a}`) !== 1) defects++;
    }
    return defects;
}

// Signed volume via the divergence theorem; positive means normals face outward.
function volume(tris) {
    let v = 0;
    for (const [a, b, c] of tris) {
        v +=
            (a[0] * (b[1] * c[2] - b[2] * c[1]) -
                a[1] * (b[0] * c[2] - b[2] * c[0]) +
                a[2] * (b[0] * c[1] - b[1] * c[0])) /
            6;
    }
    return v;
}

const boxVolume = (rects) => rects.reduce((s, r) => s + (r.x1 - r.x0) * (r.y1 - r.y0) * r.h, 0);

describe('contribution skyline STL', () => {
    it('meshes a stepped block as a closed solid with the right volume', () => {
        const rects = [
            { x0: 0, x1: 10, y0: 0, y1: 10, h: 2 },
            { x0: 2, x1: 4, y0: 2, y1: 4, h: 7 },
            { x0: 4, x1: 6, y0: 2, y1: 4, h: 5 }, // shares a wall with the taller column
        ];
        const tris = meshHeightfield(rects);
        expect(edgeDefects(tris)).toBe(0);
        expect(volume(tris)).toBeCloseTo(10 * 10 * 2 + 4 * 5 + 4 * 3, 6);
    });

    it('keeps lettering manifold where pixels touch only diagonally', () => {
        const rects = [{ x0: -1, x1: 30, y0: -1, y1: 6, h: 1 }, ...textRects('X/@', 0, 0, 0.6, 1.8)];
        expect(edgeDefects(meshHeightfield(rects))).toBe(0);
    });

    it.each(['linear', 'sqrt', 'level'])('builds a watertight model of the real data (%s scale)', (scale) => {
        const model = buildSkyline(data, { scale });
        expect(edgeDefects(model.tris)).toBe(0);
        expect(volume(model.tris)).toBeGreaterThan(model.width * model.depth * DEFAULTS.base);
    });

    it('gives every day with contributions a column and leaves empty days flat', () => {
        const plain = layout(data, { label: null, months: false });
        const active = data.days.filter((d) => d.count > 0).length;
        expect(plain.rects.length).toBe(1 + active);
        const tallest = Math.max(...plain.rects.map((r) => r.h));
        expect(tallest).toBeCloseTo(DEFAULTS.base + DEFAULTS.maxHeight, 6);
        // Columns don't overlap, so the mesh volume is exactly plate + columns.
        const model = buildSkyline(data, { label: null, months: false });
        const plate = plain.rects[0];
        const columns =
            boxVolume(plain.rects.slice(1)) - boxVolume(plain.rects.slice(1).map((r) => ({ ...r, h: plate.h })));
        expect(volume(model.tris)).toBeCloseTo(boxVolume([plate]) + columns, 1);
    });

    it('scales column height monotonically from the minimum to the maximum', () => {
        const o = { ...DEFAULTS };
        expect(columnHeight(0, 14, o)).toBe(0);
        expect(columnHeight(1, 14, o)).toBeGreaterThanOrEqual(o.minHeight);
        expect(columnHeight(14, 14, o)).toBeCloseTo(o.maxHeight, 6);
        expect(columnHeight(5, 14, { ...o, scale: 'sqrt' })).toBeGreaterThan(columnHeight(5, 14, o));
        expect(columnHeight(10, 14, { ...o, scale: 'level' })).toBeCloseTo(o.maxHeight, 6);
    });

    it('writes a binary STL whose size matches its triangle count', () => {
        const tris = meshHeightfield([{ x0: 0, x1: 1, y0: 0, y1: 1, h: 1 }]);
        const stl = toBinaryStl(tris);
        expect(stl.readUInt32LE(80)).toBe(tris.length);
        expect(stl.length).toBe(84 + 50 * tris.length);
    });
});
