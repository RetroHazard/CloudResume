import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CertificationList from '../components/certification_list';

const sampleData = {
    Certifications: [
        {
            certification: 'Sample Certification',
            issuer: 'Sample Issuer',
            credential_id: '123456789',
            date: '2024-05-24',
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

// Mock the DataLoader component
jest.mock('../utils/dataLoader', () => ({
    __esModule: true,
    default: ({ children }) => children(sampleData),
}));

describe('CertificationList Component', () => {
    it('renders correctly', () => {
        const { getByText } = render(<CertificationList />);
        expect(getByText('Sample Certification')).toBeInTheDocument();
        expect(getByText('Sample Issuer')).toBeInTheDocument();
        expect(getByText(/Credential ID:/)).toBeInTheDocument(); // Using a regular expression
        expect(getByText(/Date Issued:/)).toBeInTheDocument(); // Using a regular expression
    });

    it('matches snapshot', () => {
        const { container } = render(<CertificationList />);
        expect(container).toMatchSnapshot();
    });
});