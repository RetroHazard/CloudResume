import {
    formatJstTime,
    getJstHour,
    getServiceLevel,
    getServiceTraffic,
    JST_TIME_PLACEHOLDER,
    SERVICE_LEVELS,
} from '../utils/serviceStatus';

// The header claims to show Tokyo time and the Tokyo timetable no matter where
// the visitor is, so these helpers are pinned against absolute UTC instants.
describe('JST clock helpers', () => {
    test('converts UTC instants to the Tokyo wall clock (UTC+9, no DST)', () => {
        expect(formatJstTime(new Date('2026-07-25T00:00:00Z'))).toBe('09:00:00');
        expect(formatJstTime(new Date('2026-07-25T15:00:00Z'))).toBe('00:00:00');
        expect(formatJstTime(new Date('2026-07-25T14:59:59Z'))).toBe('23:59:59');
        // January — Japan keeps UTC+9 year-round, so the offset does not move.
        expect(formatJstTime(new Date('2026-01-15T00:30:05Z'))).toBe('09:30:05');
    });

    test('reports midnight as hour 0, never 24', () => {
        expect(getJstHour(new Date('2026-07-25T15:00:00Z'))).toBe(0);
        expect(formatJstTime(new Date('2026-07-25T15:00:00Z')).startsWith('00:')).toBe(true);
    });

    test('falls back to a placeholder rather than rendering an invalid date', () => {
        expect(formatJstTime(new Date('nonsense'))).toBe(JST_TIME_PLACEHOLDER);
        expect(getJstHour(new Date('nonsense'))).toBeNull();
    });
});

describe('service level bands', () => {
    // hour → the level the badge must show, checked at both ends of each band.
    const cases = [
        [0, SERVICE_LEVELS.closed],
        [3, SERVICE_LEVELS.closed],
        [5, SERVICE_LEVELS.closed],
        [6, SERVICE_LEVELS.reduced],
        [8, SERVICE_LEVELS.reduced],
        [9, SERVICE_LEVELS.full],
        [13, SERVICE_LEVELS.full],
        [17, SERVICE_LEVELS.full],
        [18, SERVICE_LEVELS.reduced],
        [21, SERVICE_LEVELS.reduced],
        [22, SERVICE_LEVELS.last],
        [23, SERVICE_LEVELS.last],
    ];

    test.each(cases)('JST %i:00 is %o', (hour, expected) => {
        // Build the instant from the JST hour: 00:00 JST is 15:00Z the day before.
        const utcHour = (hour + 24 - 9) % 24;
        const day = hour < 9 ? 24 : 25;
        const date = new Date(`2026-07-${day}T${String(utcHour).padStart(2, '0')}:30:00Z`);
        expect(getJstHour(date)).toBe(hour);
        expect(getServiceLevel(date)).toBe(expected);
    });

    test('treats an unusable clock as out of service instead of claiming to be open', () => {
        expect(getServiceLevel(new Date('nonsense'))).toBe(SERVICE_LEVELS.closed);
    });
});

// The background map reads its train count and speed off the same bands, so the
// profiles have to thin out monotonically as the timetable winds down.
describe('background traffic profiles', () => {
    const order = ['full', 'reduced', 'last', 'closed'];

    test('fewer and slower trains as service winds down', () => {
        const trains = order.map((key) => SERVICE_LEVELS[key].traffic.trains);
        const speeds = order.map((key) => SERVICE_LEVELS[key].traffic.speed);
        expect(trains).toEqual([...trains].sort((a, b) => b - a));
        expect(speeds).toEqual([...speeds].sort((a, b) => b - a));
    });

    test('only the overnight shutdown stables the fleet', () => {
        expect(SERVICE_LEVELS.closed.traffic).toMatchObject({ trains: 0, stabled: true });
        for (const key of ['full', 'reduced', 'last']) {
            expect(SERVICE_LEVELS[key].traffic.stabled).toBe(false);
            expect(SERVICE_LEVELS[key].traffic.trains).toBeGreaterThan(0);
        }
    });

    test('reads the profile straight off the clock', () => {
        // 13:20 JST is full service; 03:00 JST is the shutdown.
        expect(getServiceTraffic(new Date('2026-07-25T04:20:00Z'))).toBe(SERVICE_LEVELS.full.traffic);
        expect(getServiceTraffic(new Date('2026-07-24T18:00:00Z'))).toBe(SERVICE_LEVELS.closed.traffic);
        expect(getServiceTraffic(new Date('nonsense'))).toBe(SERVICE_LEVELS.closed.traffic);
    });
});
