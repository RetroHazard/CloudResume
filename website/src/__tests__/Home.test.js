import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Home from '../pages/Home/index';

const mockData = {
    profilePicture: '/images/placeholder.png',
    resumeLink: 'https://example.com/resume.pdf',
    fullName: 'John Doe',
    jobTitle: 'Software Engineer',
    location: 'New York, NY',
    availability: ['Available for consulting'],
};

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: mockData, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));

vi.mock('../components/social_links', () => ({ default: () => null }));
vi.mock('../components/personal_summary', () => ({ default: () => null }));

describe('Home component', () => {
    it('renders profile data correctly', () => {
        render(<HelmetProvider><Home /></HelmetProvider>);
        // Profile photo with descriptive alt
        expect(screen.getByAltText('Photo of John Doe')).toHaveAttribute('src', mockData.profilePicture);
        // Download CV is now a link (not button-in-anchor)
        const downloadLink = screen.getByRole('link', { name: /download cv/i });
        expect(downloadLink).toHaveAttribute('href', mockData.resumeLink);
        // Name, title, location
        expect(screen.getByText(mockData.fullName)).toBeInTheDocument();
        expect(screen.getByText(mockData.jobTitle)).toBeInTheDocument();
        expect(screen.getByText(mockData.location)).toBeInTheDocument();
        // Availability tag from JSON (no salary)
        expect(screen.getByText('Available for consulting')).toBeInTheDocument();
        expect(screen.queryByText(/salary/i)).not.toBeInTheDocument();
    });
});
