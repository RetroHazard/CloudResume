import { act, render, screen } from '@testing-library/react';
import StationHeader from '../components/station_header';

// The bar is the site's one piece of "live" signage: it must read JST even when
// the browser is set to another zone, and the badge must follow Tokyo's clock.
describe('StationHeader', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderAt = (iso) => {
        vi.setSystemTime(new Date(iso));
        render(<StationHeader />);
    };

    const tick = (ms) => act(() => vi.advanceTimersByTime(ms));

    test('shows Tokyo time regardless of the viewer’s zone', () => {
        // 04:20 UTC is 13:20 JST — the clock must not follow the host TZ.
        renderAt('2026-07-25T04:20:30Z');
        expect(screen.getByText('13:20:30')).toBeInTheDocument();
        expect(screen.getByLabelText('Tokyo time (JST) 13:20:30')).toBeInTheDocument();
    });

    test('ticks forward once a second', () => {
        renderAt('2026-07-25T04:20:30Z');
        tick(2000);
        expect(screen.getByText('13:20:32')).toBeInTheDocument();
    });

    test('reads In Service during Tokyo working hours', () => {
        renderAt('2026-07-25T04:20:30Z'); // 13:20 JST
        expect(screen.getByRole('status')).toHaveTextContent('In Service');
    });

    test('reads Reduced Service on the shoulders of the day', () => {
        renderAt('2026-07-24T22:30:00Z'); // 07:30 JST
        expect(screen.getByRole('status')).toHaveTextContent('Reduced Service');
    });

    test('reads Last Train late in the Tokyo evening', () => {
        renderAt('2026-07-25T13:30:00Z'); // 22:30 JST
        expect(screen.getByRole('status')).toHaveTextContent('Last Train');
    });

    test('reads Out of Service overnight in Tokyo', () => {
        renderAt('2026-07-25T18:00:00Z'); // 03:00 JST
        const badge = screen.getByRole('status');
        expect(badge).toHaveTextContent('Out of Service');
        // The indicator stops pulsing once the line is shut.
        expect(badge.querySelector('.animate-pulse')).toBeNull();
    });

    test('flips the badge when the clock crosses a band boundary', () => {
        renderAt('2026-07-25T08:59:59Z'); // 17:59:59 JST
        expect(screen.getByRole('status')).toHaveTextContent('In Service');
        tick(1000); // 18:00:00 JST
        expect(screen.getByRole('status')).toHaveTextContent('Reduced Service');
    });
});
