// The top bar reports Tokyo time and nothing else — a visitor in London sees the
// same clock and the same service badge as a visitor in Osaka. Both are derived
// from the JST wall clock here so they can never disagree.
//
// Japan has had no daylight saving since 1951, so JST is a flat UTC+09:00. That
// makes plain offset arithmetic exact and keeps the header off `Intl` timezone
// data entirely (no engine quirks, no `24:00:00` at midnight, trivially
// testable).

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const JST_TIME_PLACEHOLDER = '--:--:--';

const pad = (value) => String(value).padStart(2, '0');

// Tokyo wall-clock parts for an instant, or null if handed an invalid Date.
function jstParts(date) {
    const time = date instanceof Date ? date.getTime() : Number.NaN;
    if (Number.isNaN(time)) return null;
    const shifted = new Date(time + JST_OFFSET_MS);
    return {
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes(),
        second: shifted.getUTCSeconds(),
    };
}

// Tokyo's hour as 0–23, or null for an invalid Date.
export function getJstHour(date = new Date()) {
    return jstParts(date)?.hour ?? null;
}

export function formatJstTime(date = new Date()) {
    const parts = jstParts(date);
    if (!parts) return JST_TIME_PLACEHOLDER;
    return `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

// Service bands read as a rail timetable: full daytime service, reduced service
// on the shoulders either side of it, last trains late on, then the overnight
// shutdown. `key` drives the badge styling in the header.
export const SERVICE_LEVELS = {
    full: {
        key: 'full',
        label: 'In Service',
        detail: 'In service — full service 09:00–18:00 JST',
    },
    reduced: {
        key: 'reduced',
        label: 'Reduced Service',
        detail: 'Reduced service — off-peak hours in Tokyo',
    },
    last: {
        key: 'last',
        label: 'Last Train',
        detail: 'Last train — service winding down for the night in Tokyo',
    },
    closed: {
        key: 'closed',
        label: 'Out of Service',
        detail: 'Out of service — overnight shutdown, 00:00–06:00 JST',
    },
};

export function getServiceLevel(date = new Date()) {
    const hour = getJstHour(date);
    if (hour === null) return SERVICE_LEVELS.closed;
    if (hour < 6) return SERVICE_LEVELS.closed; // 00:00–05:59
    if (hour < 9) return SERVICE_LEVELS.reduced; // 06:00–08:59
    if (hour < 18) return SERVICE_LEVELS.full; // 09:00–17:59
    if (hour < 22) return SERVICE_LEVELS.reduced; // 18:00–21:59
    return SERVICE_LEVELS.last; // 22:00–23:59
}
