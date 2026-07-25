// The résumé JSON is hand-maintained and uses several sentinels for "still
// running" (`---`, `NOW`, `present`) plus inconsistent zero-padding
// (`2024-8-16` next to `2024-10-19`). Every date the boards render goes through
// here so the UI reads one way regardless of how the data was typed.

const ONGOING = new Set(['---', 'now', 'present', 'current', '']);
const UNKNOWN = new Set(['n/a', 'na', '-', '--', 'none']);

const norm = (value) => String(value ?? '').trim().toLowerCase();

export const isOngoing = (value) => ONGOING.has(norm(value));
export const isUnknown = (value) => UNKNOWN.has(norm(value));

// Zero-pads the month/day parts of a `YYYY[-M[-D]]` string. Anything that isn't
// in that shape is passed through untouched.
export function formatDate(value) {
    const raw = String(value ?? '').trim();
    if (isOngoing(raw)) return 'Present';
    if (isUnknown(raw)) return '—';
    const parts = raw.split('-');
    if (!/^\d{4}$/.test(parts[0])) return raw;
    return parts.map((part, i) => (i === 0 ? part : part.padStart(2, '0'))).join('-');
}

export const formatRange = (start, end) => `${formatDate(start)} — ${formatDate(end)}`;

// A pass is expired when it carries a real end date that has already passed.
// Undated ("N/A") and open-ended credentials are never marked expired.
export function isExpired(expiry, now = new Date()) {
    const raw = String(expiry ?? '').trim();
    if (!raw || isUnknown(raw) || isOngoing(raw)) return false;
    const parts = formatDate(raw).split('-');
    if (parts.length < 3 || !/^\d{4}$/.test(parts[0])) return false;
    const time = Date.parse(`${parts.slice(0, 3).join('-')}T00:00:00Z`);
    return !Number.isNaN(time) && time < now.getTime();
}
