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

    test('exposes the full name to assistive tech', () => {
        const { getByLabelText } = render(<SplitFlap text='Alexander Bracken' ariaLabel='Alexander Bracken' />);
        expect(getByLabelText('Alexander Bracken')).toBeInTheDocument();
    });
});
