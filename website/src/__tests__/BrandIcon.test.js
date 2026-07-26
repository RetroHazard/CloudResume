import { render, screen, waitFor } from '@testing-library/react';
import { BrandIcon, monogramFor } from '../components/ui/brand_icon';

const { iconLoaded, loadIcon } = vi.hoisted(() => ({
    iconLoaded: vi.fn(() => false),
    loadIcon: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@iconify-icon/react', () => ({
    Icon: ({ icon, width, height, className }) => (
        <span data-testid='iconify' data-icon={icon} data-width={width} data-height={height} className={className} />
    ),
    iconLoaded,
    loadIcon,
}));

beforeEach(() => {
    vi.clearAllMocks();
    iconLoaded.mockReturnValue(false);
    loadIcon.mockResolvedValue({});
});

describe('monogramFor', () => {
    it.each([
        ['CrowdStrike Falcon', 'CF'],
        ['Zscaler', 'ZS'],
        ['Kandji', 'KA'],
        ['OpenTofu', 'OT'],
        ['Node.js', 'NJ'],
        // Trailing capitals are a suffix, not a word boundary.
        ['macOS', 'MA'],
        ['tailwindCSS', 'TA'],
        ['', '??'],
        [null, '??'],
    ])('derives %s → %s', (name, expected) => {
        expect(monogramFor(name)).toBe(expected);
    });
});

describe('BrandIcon', () => {
    it('renders the Iconify icon when the name resolves', async () => {
        render(<BrandIcon icon='simple-icons:qualys' name='Qualys' size='1.5em' />);
        await waitFor(() => expect(screen.getByTestId('iconify')).toHaveAttribute('data-icon', 'simple-icons:qualys'));
        expect(screen.getByTestId('iconify')).toHaveAttribute('data-width', '1.5em');
    });

    it('falls back to a monogram when Iconify has no such icon', async () => {
        loadIcon.mockRejectedValue(new Error('not found'));
        render(<BrandIcon icon='simple-icons:zscaler' name='Zscaler' />);
        await waitFor(() => expect(screen.getByText('ZS')).toBeInTheDocument());
        expect(screen.queryByTestId('iconify')).not.toBeInTheDocument();
    });

    it('skips the lookup entirely when the data declares no logo', () => {
        render(<BrandIcon icon={null} name='CrowdStrike Falcon' />);
        expect(screen.getByText('CF')).toBeInTheDocument();
        expect(loadIcon).not.toHaveBeenCalled();
    });

    it('prefers an explicit monogram override', () => {
        render(<BrandIcon icon={null} name='CrowdStrike Falcon' monogram='CS' />);
        expect(screen.getByText('CS')).toBeInTheDocument();
    });

    it('renders the fallback plate at the same footprint as the icon it replaces', () => {
        const { container } = render(<BrandIcon icon={null} name='Kandji' size='1.5em' />);
        const plate = container.firstChild;
        expect(plate).toHaveStyle({ width: '1.5em', height: '1.5em' });
        // Glyph scales with the plate rather than sitting at a fixed size.
        expect(screen.getByText('KA')).toHaveStyle({ fontSize: '0.63em' });
    });

    it('does not render the icon before a slow lookup settles into failure', async () => {
        let reject;
        loadIcon.mockReturnValue(new Promise((_, r) => { reject = r; }));
        render(<BrandIcon icon='simple-icons:zscaler' name='Zscaler' />);
        // Optimistic: iconify-icon reserves the space itself, so no monogram flash.
        expect(screen.getByTestId('iconify')).toBeInTheDocument();
        reject(new Error('not found'));
        await waitFor(() => expect(screen.getByText('ZS')).toBeInTheDocument());
    });
});
