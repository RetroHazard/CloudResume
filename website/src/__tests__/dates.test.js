import { formatDate, formatRange, isExpired, isOngoing, isUnknown } from '../utils/dates';

// The résumé JSON is hand-maintained and inconsistent: three different sentinels
// mean "still running" and months are sometimes unpadded. These helpers are the
// single place that inconsistency is absorbed, so they are worth pinning down.
describe('date helpers', () => {
    test('recognises every ongoing sentinel used in the data set', () => {
        ['---', 'NOW', 'now', 'Present', 'current', ''].forEach((value) => {
            expect(isOngoing(value)).toBe(true);
        });
        expect(isOngoing('2024-01')).toBe(false);
    });

    test('recognises unknown-value sentinels', () => {
        ['N/A', 'n/a', '-', 'none'].forEach((value) => expect(isUnknown(value)).toBe(true));
        expect(isUnknown('497518')).toBe(false);
    });

    test('renders ongoing and unknown sentinels as words, never raw', () => {
        expect(formatDate('---')).toBe('Present');
        expect(formatDate('NOW')).toBe('Present');
        expect(formatDate('N/A')).toBe('—');
    });

    test('zero-pads partial dates so board columns line up', () => {
        expect(formatDate('2024-8-16')).toBe('2024-08-16');
        expect(formatDate('2024-10-19')).toBe('2024-10-19');
        expect(formatDate('2025-9')).toBe('2025-09');
        expect(formatDate('2016')).toBe('2016');
    });

    test('passes through anything that is not a date', () => {
        expect(formatDate('Generic Start')).toBe('Generic Start');
    });

    test('formats a range with a single ongoing marker', () => {
        expect(formatRange('2025-09', '---')).toBe('2025-09 — Present');
        expect(formatRange('2012-08', '2014-01')).toBe('2012-08 — 2014-01');
    });

    test('flags lapsed credentials but never undated or open-ended ones', () => {
        const now = new Date('2026-07-25T00:00:00Z');
        expect(isExpired('2017-11-30', now)).toBe(true);
        expect(isExpired('2027-8-16', now)).toBe(false);
        expect(isExpired('N/A', now)).toBe(false);
        expect(isExpired('', now)).toBe(false);
    });
});
