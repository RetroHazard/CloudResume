import { render } from '@testing-library/react';
import { SplitFlap } from '../components/split_flap';

// The board cycles a glyph reel of differing character widths. To keep the
// surrounding layout from jittering as glyphs change, every cell must render at
// a fixed width, so the board's total width is constant regardless of glyph.
describe('SplitFlap', () => {
    test('renders one fixed-width cell per non-space character', () => {
        const name = 'Alexander Bracken';
        const { container } = render(<SplitFlap text={name} ariaLabel={name} />);

        const cells = container.querySelectorAll('span[style*="width"]');
        const expected = name.replace(/ /g, '').length;
        expect(cells).toHaveLength(expected);

        // Every cell is locked to the same width — the anti-jitter guarantee.
        cells.forEach((cell) => {
            expect(cell.style.width).toBe('0.72em');
        });
    });

    // The reel glyphs are noise, so every cell is aria-hidden and the settled
    // text is exposed once via an off-screen span. It must not rely on an
    // aria-label on a generic element, which assistive tech is free to ignore.
    test('exposes the full name to assistive tech', () => {
        const { getByText } = render(<SplitFlap text='Alexander Bracken' ariaLabel='Alexander Bracken' />);
        const label = getByText('Alexander Bracken');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('sr-only');
    });
});
