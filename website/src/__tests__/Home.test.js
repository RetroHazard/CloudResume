import { render, screen } from '@testing-library/react';
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
    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders profile data correctly', () => {
        render(<Home />);
        // Profile photo with descriptive alt
        expect(screen.getByAltText('Photo of John Doe')).toHaveAttribute('src', mockData.profilePicture);
        // Download CV is now a link (not button-in-anchor)
        const downloadLink = screen.getByRole('link', { name: /download cv/i });
        expect(downloadLink).toHaveAttribute('href', mockData.resumeLink);
        // Name (rendered as per-character spans; assert via the heading's accessible name), title, location
        expect(screen.getByRole('heading', { name: mockData.fullName })).toBeInTheDocument();
        expect(screen.getByText(mockData.jobTitle)).toBeInTheDocument();
        expect(screen.getByText(mockData.location)).toBeInTheDocument();
        // Availability tag from JSON (no salary)
        expect(screen.getByText('Available for consulting')).toBeInTheDocument();
        expect(screen.queryByText(/salary/i)).not.toBeInTheDocument();
    });

    // The board header's status pill is a live service claim, not decoration.
    it('reports the concourse board status from the Tokyo timetable', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-25T04:20:00Z')); // 13:20 JST
        const { unmount } = render(<Home />);
        expect(screen.getByText('All Lines Running')).toBeInTheDocument();
        unmount();

        vi.setSystemTime(new Date('2026-07-25T18:00:00Z')); // 03:00 JST
        render(<Home />);
        expect(screen.getByText('Lines Closed')).toBeInTheDocument();
        expect(screen.queryByText('All Lines Running')).not.toBeInTheDocument();
    });
});
