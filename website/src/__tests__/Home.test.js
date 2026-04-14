import { render, screen } from '@testing-library/react';
import Home from '../pages/Home/index';

const mockData = {
    profilePicture: '/images/placeholder.png',
    resumeLink: 'https://example.com/resume.pdf',
    fullName: 'John Doe',
    jobTitle: 'Software Engineer',
    location: 'New York, NY',
    salary: '125,000',
    currency: 'USD',
    currency_icon: 'fa6-solid:dollar-sign',
};

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: mockData, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));

vi.mock('../components/social_links', () => ({ default: () => null }));
vi.mock('../components/personal_summary', () => ({ default: () => null }));

describe('Home component', () => {
    it('renders profile data correctly', () => {
        render(<Home />);
        expect(screen.getByText(mockData.fullName)).toBeInTheDocument();
        expect(screen.getByText(mockData.jobTitle)).toBeInTheDocument();
        expect(screen.getByText(mockData.location)).toBeInTheDocument();
    });
});
