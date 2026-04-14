import { render, screen } from '@testing-library/react';
import SocialLinks from '../components/social_links';

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: {
            Socials: Array.from({ length: 3 }, (_, index) => ({
                display: true,
                name: `Social${index + 1}`,
                link: `http://social${index + 1}.com`,
                logo: 'mdi:home',
            })),
        },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

describe('SocialLinks Component', () => {
    test('renders the correct number of social links', () => {
        render(<SocialLinks />);
        const socialLinks = screen.getAllByRole('link');
        expect(socialLinks).toHaveLength(3);
        socialLinks.forEach((link, index) => {
            expect(link).toHaveAttribute('href', `http://social${index + 1}.com`);
            expect(link).toHaveAttribute('aria-label', `Social${index + 1}`);
        });
    });

    test('matches the snapshot', () => {
        const { asFragment } = render(<SocialLinks />);
        expect(asFragment()).toMatchSnapshot();
    });
});
