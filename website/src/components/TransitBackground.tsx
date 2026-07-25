import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';

// Ambient wayfinding backdrop: a procedurally-generated transit diagram drawn
// fresh on every page load. Coloured metro lines cross the viewport with the
// clean 45°/90° bends of a real station map, interchange stops sit at the turns,
// and (motion permitting) a train of light glides along each line. The whole map
// drifts slowly. Calm on purpose — the split-flap board owns the motion budget.

const VW = 1440;
const VH = 900;
const GRID = 60; // lines snap to this grid, giving the map its tidy geometry
const LINE_COLORS = ['#2ee08a', '#4aa8ff', '#ffc24b', '#b48cff']; // neon / blue / amber / purple

type Pt = [number, number];
type Line = { id: string; color: string; d: string; stations: Pt[]; dur: string; begin: string };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const snap = (v: number) => Math.round(v / GRID) * GRID;
const step = (min: number, max: number) => GRID * (min + Math.floor(Math.random() * (max - min + 1)));

// A line is a staircase: straight runs alternating with single 45° steps, kept
// inside a band so sibling lines of the same axis don't collapse onto each other.
function buildLineX(top: number, bot: number): Pt[] {
    const margin = 160;
    let x = -margin;
    let y = snap(rand(top, bot));
    const pts: Pt[] = [[x, y]];
    let straight = true;
    let guard = 0;
    while (x < VW + margin && guard++ < 30) {
        if (straight) {
            x += step(2, 6);
            pts.push([snap(x), y]);
        } else {
            const len = step(1, 3);
            let up = Math.random() < 0.5;
            if (y - len < top) up = false;
            if (y + len > bot) up = true;
            y += up ? -len : len;
            x += len;
            pts.push([snap(x), snap(y)]);
        }
        straight = !straight;
    }
    pts.push([VW + margin, y]);
    return pts;
}

function buildLineY(left: number, right: number): Pt[] {
    const margin = 160;
    let y = -margin;
    let x = snap(rand(left, right));
    const pts: Pt[] = [[x, y]];
    let straight = true;
    let guard = 0;
    while (y < VH + margin && guard++ < 30) {
        if (straight) {
            y += step(2, 6);
            pts.push([x, snap(y)]);
        } else {
            const len = step(1, 3);
            let leftward = Math.random() < 0.5;
            if (x - len < left) leftward = false;
            if (x + len > right) leftward = true;
            x += leftward ? -len : len;
            y += len;
            pts.push([snap(x), snap(y)]);
        }
        straight = !straight;
    }
    pts.push([x, VH + margin]);
    return pts;
}

const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');

// Interchange stops: a few on-screen turn vertices per line.
function pickStations(pts: Pt[]): Pt[] {
    const out: Pt[] = [];
    for (let i = 1; i < pts.length - 1 && out.length < 3; i++) {
        const [x, y] = pts[i];
        if (x > 24 && x < VW - 24 && y > 24 && y < VH - 24 && Math.random() < 0.5) out.push([x, y]);
    }
    return out;
}

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildMap(): Line[] {
    const orientations = shuffle(['x', 'x', 'y', 'y']);
    let xi = 0;
    let yi = 0;
    return orientations.map((o, i) => {
        let pts: Pt[];
        if (o === 'x') {
            pts = xi++ % 2 === 0 ? buildLineX(VH * 0.1, VH * 0.42) : buildLineX(VH * 0.58, VH * 0.9);
        } else {
            pts = yi++ % 2 === 0 ? buildLineY(VW * 0.12, VW * 0.44) : buildLineY(VW * 0.56, VW * 0.88);
        }
        return {
            id: `tl${i}`,
            color: LINE_COLORS[i],
            d: toPath(pts),
            stations: pickStations(pts),
            dur: (10 + Math.random() * 7).toFixed(2),
            begin: (-(Math.random() * 14)).toFixed(2),
        };
    });
}

export default function TransitBackground() {
    const prefersReduced = useReducedMotion();
    // Generated once per mount → a different network on every page load.
    const lines = useMemo(buildMap, []);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
        >
            {/* signal glows */}
            <div className="absolute -top-48 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-neon/[0.08] blur-[130px]" />
            <div className="absolute bottom-[-10rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-glow/[0.06] blur-[130px]" />

            {/* transit map */}
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 ${VW} ${VH}`}
                preserveAspectRatio="xMidYMid slice"
            >
                <g className={prefersReduced ? undefined : 'tb-drift'}>
                    {lines.map((l) => (
                        <path
                            key={l.id}
                            id={l.id}
                            d={l.d}
                            fill="none"
                            stroke={l.color}
                            strokeWidth={3}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity={0.5}
                            style={{ filter: `drop-shadow(0 0 5px ${l.color})` }}
                        />
                    ))}
                    {lines.flatMap((l) =>
                        l.stations.map((s, idx) => (
                            <circle
                                key={`${l.id}-s${idx}`}
                                cx={s[0]}
                                cy={s[1]}
                                r={6}
                                fill="#071319"
                                stroke={l.color}
                                strokeWidth={2.5}
                                opacity={0.85}
                            />
                        )),
                    )}
                    {!prefersReduced &&
                        lines.map((l) => (
                            <circle key={`${l.id}-train`} r={4.5} fill="#ffffff" style={{ filter: `drop-shadow(0 0 6px ${l.color})` }}>
                                <animateMotion dur={`${l.dur}s`} begin={`${l.begin}s`} repeatCount="indefinite" rotate="auto">
                                    <mpath href={`#${l.id}`} />
                                </animateMotion>
                            </circle>
                        ))}
                </g>
            </svg>

            <style>{`
                .tb-drift { animation: tb-drift 26s ease-in-out infinite alternate; transform-origin: center; }
                @keyframes tb-drift { from { transform: translate(0, 0); } to { transform: translate(-26px, -14px); } }
                @media (prefers-reduced-motion: reduce) { .tb-drift { animation: none !important; } }
            `}</style>
        </div>
    );
}
