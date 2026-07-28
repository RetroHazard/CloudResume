import { act, render, screen } from '@testing-library/react';
import StationHeader from '../components/station_header';
import ServiceStatusPill from '../components/service_status_pill';
import TransitBackground from '../components/TransitBackground';

// Everything that reads the Tokyo timetable — the header clock and badge, the
// concourse pill, the trains on the background map — hangs off one ticking
// clock. These tests are about that clock being live and shared: the readouts
// must never disagree, and none of them may wait for a reload.
describe('site clock', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderAllAt = (iso) => {
        vi.setSystemTime(new Date(iso));
        return render(
            <>
                <StationHeader />
                <ServiceStatusPill />
                <TransitBackground />
            </>,
        );
    };

    const tick = (ms) => act(() => vi.advanceTimersByTime(ms));

    test('flips every readout on the same tick, not on the next reload', () => {
        const { container } = renderAllAt('2026-07-25T08:59:59Z'); // 17:59:59 JST
        expect(screen.getByRole('status')).toHaveTextContent('In Service');
        expect(screen.getByText('All Lines Running')).toBeInTheDocument();
        expect(container.querySelectorAll('animateMotion')).toHaveLength(4);

        tick(1000); // 18:00:00 JST — full service ends

        expect(screen.getByText('18:00:00')).toBeInTheDocument(); // clock kept ticking
        expect(screen.getByRole('status')).toHaveTextContent('Reduced Service');
        // Badge and pill both, on the same tick — nothing left saying otherwise.
        expect(screen.getAllByText('Reduced Service')).toHaveLength(2);
        expect(screen.queryByText('All Lines Running')).not.toBeInTheDocument();
        expect(container.querySelectorAll('animateMotion')).toHaveLength(2);
    });

    test('changes over within a second of the boundary', () => {
        renderAllAt('2026-07-25T14:59:59Z'); // 23:59:59 JST, last train
        expect(screen.getByText('Last Trains Running')).toBeInTheDocument();
        tick(1000); // 00:00:00 JST — shutdown
        expect(screen.getByText('Lines Closed')).toBeInTheDocument();
    });

    test('resyncs when a throttled tab is looked at again', () => {
        renderAllAt('2026-07-25T08:00:00Z'); // 17:00 JST
        expect(screen.getByText('All Lines Running')).toBeInTheDocument();

        // The tab goes to the background: the browser stops running its timers
        // while the clock moves on by two hours.
        vi.setSystemTime(new Date('2026-07-25T10:00:00Z')); // 19:00 JST
        act(() => document.dispatchEvent(new Event('visibilitychange')));

        // No timer was advanced — the readouts caught up purely on the way back.
        expect(screen.getAllByText('Reduced Service')).toHaveLength(2);
        expect(screen.queryByText('All Lines Running')).not.toBeInTheDocument();
        expect(screen.getByText('19:00:00')).toBeInTheDocument();
    });

    test('catches up on a back/forward-cache restore', () => {
        renderAllAt('2026-07-25T08:00:00Z'); // 17:00 JST
        vi.setSystemTime(new Date('2026-07-25T18:00:00Z')); // 03:00 JST next day
        act(() => window.dispatchEvent(new Event('pageshow')));
        expect(screen.getByText('Lines Closed')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Out of Service');
    });

    test('stops ticking once nothing is subscribed', () => {
        const { unmount } = renderAllAt('2026-07-25T08:00:00Z');
        const pending = vi.getTimerCount();
        expect(pending).toBeGreaterThan(0);
        unmount();
        expect(vi.getTimerCount()).toBeLessThan(pending);
    });
});
