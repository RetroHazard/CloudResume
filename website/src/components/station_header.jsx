import { useEffect, useState } from 'react';
import { formatJstTime, getServiceLevel } from '../utils/serviceStatus';

// Slim wayfinding bar pinned to the top of every page — like the sign above a
// platform: line roundel + network name on the left, a live Tokyo clock and a
// service indicator on the right. Both right-hand readouts are pinned to JST
// regardless of where the viewer is, and the badge follows the Tokyo timetable.

// Signal colours per service level: green go, amber off-peak, red late, and a
// dead grey dot (no pulse) once the line is shut for the night.
const LEVEL_STYLES = {
    full: { text: 'text-neon', dot: 'bg-neon animate-pulse' },
    reduced: { text: 'text-glow', dot: 'bg-glow animate-pulse' },
    last: { text: 'text-alert', dot: 'bg-alert animate-pulse' },
    closed: { text: 'text-content-accent', dot: 'bg-content-accent' },
};

function useTokyoNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

export default function StationHeader() {
    const now = useTokyoNow();
    const time = formatJstTime(now);
    const level = getServiceLevel(now);
    const styles = LEVEL_STYLES[level.key] ?? LEVEL_STYLES.full;
    return (
        <header
            id="station-header"
            className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md"
        >
            <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-neon font-heading text-xs font-extrabold text-background">
                        AB
                    </span>
                    <span className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-content-header">
                        Cloud&nbsp;Line
                    </span>
                    <span className="ml-1 hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-content-accent sm:inline">
                        · Network Résumé
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span
                        className="tabular font-mono text-xs font-medium text-content-subtitle"
                        aria-label={`Tokyo time (JST) ${time}`}
                    >
                        <span className="text-content-accent">JST</span> {time}
                    </span>
                    <span
                        role="status"
                        title={level.detail}
                        aria-label={level.detail}
                        className={`flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] max-sm:hidden ${styles.text}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                        {level.label}
                    </span>
                </div>
            </div>
        </header>
    );
}
