import { render, screen } from '@testing-library/react';
import SocialLinks from '../components/social_links';

// Mock the DataLoader component
vi.mock('../utils/dataLoader', () => {
    return {
        default: ({ children }) => {
            const data = {
                Socials: Array.from({ length: 3 }, (_, index) => ({
                    display: true,
                    name: `Social${index + 1}`,
                    link: `http://social${index + 1}.com`,
                    logo: 'mdi:home',
                })),
            };
            return children(data);
        },
    };
});

describe('SocialLinks Component', () => {
    test('renders the correct number of social links', () => {
        render(<SocialLinks />);

        const socialLinks = screen.getAllByRole('link');
        const numberOfLinks = socialLinks.length;

        expect(numberOfLinks).toBe(3);

        socialLinks.forEach((link, index) => {
            expect(link).toHaveAttribute('href', `http://social${index + 1}.com`);
            expect(link).toHaveAttribute('aria-label', `Social${index + 1}`);
            const icon = link.querySelector('.social-link');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('icon', 'mdi:home');
        });
    });

    test('matches the snapshot', () => {
        const { asFragment } = render(<SocialLinks />);
        expect(asFragment()).toMatchSnapshot();
    });
});
