import { act, render, screen } from '@testing-library/react';
import ServiceStatusPill from '../components/service_status_pill';

// The concourse pill is a service claim, so it has to follow the Tokyo
// timetable rather than assert "All Lines Running" around the clock.
describe('ServiceStatusPill', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderAt = (iso) => {
        vi.setSystemTime(new Date(iso));
        return render(<ServiceStatusPill />);
    };

    test('claims every line is running only during full service', () => {
        renderAt('2026-07-25T04:20:00Z'); // 13:20 JST
        expect(screen.getByText('All Lines Running')).toBeInTheDocument();
    });

    test('reads Reduced Service on the shoulders of the Tokyo day', () => {
        renderAt('2026-07-24T22:30:00Z'); // 07:30 JST
        expect(screen.getByText('Reduced Service')).toBeInTheDocument();
        expect(screen.queryByText('All Lines Running')).not.toBeInTheDocument();
    });

    test('reads Last Trains Running late in the Tokyo evening', () => {
        renderAt('2026-07-25T13:30:00Z'); // 22:30 JST
        expect(screen.getByText('Last Trains Running')).toBeInTheDocument();
    });

    test('reads Lines Closed during the overnight shutdown, with no live signal', () => {
        const { container } = renderAt('2026-07-25T18:00:00Z'); // 03:00 JST
        expect(screen.getByText('Lines Closed')).toBeInTheDocument();
        // Nothing is running, so nothing pulses.
        expect(container.querySelector('.animate-pulse')).toBeNull();
    });

    test('carries the band detail as a tooltip', () => {
        renderAt('2026-07-25T18:00:00Z'); // 03:00 JST
        expect(screen.getByText('Lines Closed')).toHaveAttribute(
            'title',
            expect.stringContaining('overnight shutdown'),
        );
    });

    test('flips when the clock crosses a band boundary under a long-lived tab', () => {
        renderAt('2026-07-25T08:59:00Z'); // 17:59 JST
        expect(screen.getByText('All Lines Running')).toBeInTheDocument();
        vi.setSystemTime(new Date('2026-07-25T09:00:30Z')); // 18:00 JST
        act(() => vi.advanceTimersByTime(30000)); // one poll of useServiceLevel
        expect(screen.getByText('Reduced Service')).toBeInTheDocument();
    });
});
