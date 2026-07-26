import { act, render } from '@testing-library/react';
import TransitBackground from '../components/TransitBackground';

// The backdrop runs to the same Tokyo timetable as the header badge: a full
// fleet in working hours, fewer and slower trains off-peak, and everything
// stabled overnight. The map itself is random per load, so these assertions
// count trains and read durations rather than pinning geometry.
describe('TransitBackground timetable', () => {
    const runningTrains = (container) => container.querySelectorAll('animateMotion');
    // Stabled trains are the white dots pinned to a depot; stations are darker.
    const stabledTrains = (container) => container.querySelectorAll('circle[fill="#ffffff"][cx]');

    const renderAt = (iso) => {
        vi.setSystemTime(new Date(iso));
        return render(<TransitBackground />);
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('works every line during full service', () => {
        const { container } = renderAt('2026-07-25T04:20:00Z'); // 13:20 JST
        expect(runningTrains(container)).toHaveLength(4);
        expect(stabledTrains(container)).toHaveLength(0);
    });

    test('thins the service off-peak', () => {
        const { container } = renderAt('2026-07-24T22:00:00Z'); // 07:00 JST
        expect(runningTrains(container)).toHaveLength(2);
    });

    test('runs a single train on the last-train band', () => {
        const { container } = renderAt('2026-07-25T14:00:00Z'); // 23:00 JST
        expect(runningTrains(container)).toHaveLength(1);
    });

    test('stables the whole fleet during the overnight shutdown', () => {
        const { container } = renderAt('2026-07-24T18:00:00Z'); // 03:00 JST
        expect(runningTrains(container)).toHaveLength(0);
        expect(stabledTrains(container)).toHaveLength(4);
    });

    test('runs the late train slower than a daytime one', () => {
        // Base durations are 10–17s: full service leaves them alone, the
        // last-train band stretches them well past 20s.
        const day = renderAt('2026-07-25T04:20:00Z'); // 13:20 JST
        const dayDur = Number(runningTrains(day.container)[0].getAttribute('dur').replace('s', ''));
        expect(dayDur).toBeLessThan(18);

        const night = renderAt('2026-07-25T14:00:00Z'); // 23:00 JST
        const nightDur = Number(runningTrains(night.container)[0].getAttribute('dur').replace('s', ''));
        expect(nightDur).toBeGreaterThan(20);
    });

    test('picks the service back up when the shutdown ends under an open tab', () => {
        const { container } = renderAt('2026-07-24T20:59:30Z'); // 05:59:30 JST
        expect(runningTrains(container)).toHaveLength(0);

        act(() => vi.advanceTimersByTime(60000)); // → 06:00:30 JST, reduced service
        expect(runningTrains(container)).toHaveLength(2);
        expect(stabledTrains(container)).toHaveLength(0);
    });
});

describe('TransitBackground with reduced motion', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.doMock('motion/react', () => ({ useReducedMotion: () => true }));
    });

    afterEach(() => {
        vi.doUnmock('motion/react');
        vi.resetModules();
    });

    test('holds the fleet at the platforms instead of animating it', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-25T04:20:00Z')); // 13:20 JST, full service
        const { default: Background } = await import('../components/TransitBackground');
        const { container } = render(<Background />);

        expect(container.querySelectorAll('animateMotion')).toHaveLength(0);
        expect(container.querySelectorAll('circle[fill="#ffffff"][cx]')).toHaveLength(4);
        vi.useRealTimers();
    });
});
