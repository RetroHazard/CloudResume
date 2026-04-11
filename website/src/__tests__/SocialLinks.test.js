import { render, screen } from '@testing-library/react';
import SocialLinks from '../components/social_links';

// Mock the DataLoader component
vi.mock('../utils/dataLoader', () => {
    const generateRandomSocials = () => {
        const numberOfSocials = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
        return {
            Socials: Array.from({ length: numberOfSocials }, (_, index) => ({
                display: true,
                name: `Social${index + 1}`,
                link: `http://social${index + 1}.com`,
                logo: 'mdi:home', // Mock icon identifier
            })),
        };
    };

    return {
        default: ({ children }) => {
            const data = generateRandomSocials();
            return children(data);
        },
    };
});

describe('SocialLinks Component', () => {
    test('renders the correct number of social links', () => {
        render(<SocialLinks />);

        const socialLinks = screen.getAllByRole('link');
        const numberOfLinks = socialLinks.length;

        // Check that the number of links is between 1 and 5
        expect(numberOfLinks).toBeGreaterThanOrEqual(1);
        expect(numberOfLinks).toBeLessThanOrEqual(5);

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
