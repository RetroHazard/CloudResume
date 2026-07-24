import { useEffect, useState } from 'react';

// Slim wayfinding bar pinned to the top of every page — like the sign above a
// platform: line roundel + network name on the left, a live Tokyo clock and an
// in-service indicator on the right.
function useTokyoClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    try {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Tokyo',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(now);
    } catch {
        return '--:--:--';
    }
}

export default function StationHeader() {
    const time = useTokyoClock();
    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
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
                        aria-label={`Tokyo time ${time}`}
                    >
                        <span className="text-content-accent">JST</span> {time}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-neon max-sm:hidden">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
                        In Service
                    </span>
                </div>
            </div>
        </header>
    );
}
