import { act, render } from '@testing-library/react';
import CertificationList from '../components/certification_list';

const sampleData = {
    Certifications: [
        {
            certification: 'Sample Certification',
            issuer: 'Sample Issuer',
            credential_id: '123456789',
            issued_date: '2024-05-24',
            expiry_date: '2027-05-24',
            logo: 'sample_logo.png',
            links: [
                {
                    verification: [
                        {
                            website: 'https://samplewebsite.com',
                            icon: 'sample-icon',
                            display: true,
                        },
                    ],
                    credential_info: [
                        {
                            website: 'https://samplewebsite.com',
                            icon: 'sample-icon',
                            display: true,
                        },
                    ],
                },
            ],
        },
    ],
};

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: sampleData, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));

describe('CertificationList Component', () => {
    it('renders correctly', () => {
        const { getByText } = render(<CertificationList />);
        expect(getByText('Sample Certification')).toBeInTheDocument();
        expect(getByText('Sample Issuer')).toBeInTheDocument();
        expect(getByText(/ID:/)).toBeInTheDocument(); // Using a regular expression
        expect(getByText(/Issued:/)).toBeInTheDocument(); // Using a regular expression
        expect(getByText(/Expiry:/)).toBeInTheDocument(); // Using a regular expression
    });

    it('matches snapshot', () => {
        const { container } = render(<CertificationList />);
        expect(container).toMatchSnapshot();
    });

    // A pass ages by the day, so a tab left open overnight has to notice — the
    // list reads the shared clock's day stamp rather than a render-time `new
    // Date()` that never changes again.
    it('marks a pass expired when the day turns over under an open tab', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2027-05-23T23:59:59Z'));
        const { getByText, queryByText } = render(<CertificationList />);
        expect(getByText('Valid')).toBeInTheDocument();

        // Jump the wall clock past the expiry date rather than ticking a whole
        // day one second at a time, then let the clock's next tick land.
        vi.setSystemTime(new Date('2027-05-24T00:00:01Z'));
        act(() => vi.advanceTimersByTime(1000));
        expect(getByText('Expired')).toBeInTheDocument();
        expect(queryByText('Valid')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});
