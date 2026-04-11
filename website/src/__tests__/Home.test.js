import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home/index';

// Mock JSON data
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

// Mock the DataLoader component
jest.mock('../utils/dataLoader', () => ({
    __esModule: true,
    default: ({ children }) => children(mockData),
}));

// Mock the SocialLinks component
jest.mock('../components/social_links', () => ({
    __esModule: true,
    default: () => null, // Mocking the component behavior without rendering its content
}));

describe('Home component', () => {
    it('renders properly with provided data', () => {
        const { getByAltText, getByText, getByRole, asFragment } = render(<Home />);

        // Check if profile picture is rendered with correct source
        expect(getByAltText('Headshot')).toHaveAttribute('src', mockData.profilePicture);

        // Check if download button is rendered with correct href
        const downloadButton = getByRole('button', { name: 'Download CV' });
        expect(downloadButton).toBeInTheDocument();

        // Check if the parent anchor element of the button has the correct href
        const parentAnchor = downloadButton.closest('a');
        expect(parentAnchor).toHaveAttribute('href', mockData.resumeLink);

        // Check if full name is rendered correctly
        expect(getByText(mockData.fullName)).toBeInTheDocument();

        // Check if job title is rendered correctly
        expect(getByText(mockData.jobTitle)).toBeInTheDocument();

        // Check if location is rendered correctly
        expect(getByText(mockData.location)).toBeInTheDocument();

        // Check if salary is rendered correctly
        const salaryElement = getByText(`${mockData.salary} ${mockData.currency}`);
        expect(salaryElement).toBeInTheDocument();

        // Check if at least one "open-for-block" element is rendered
        const openForElements = screen.getAllByRole('generic', {
        }).filter(el => el.classList.contains('open-for-block'));
        expect(openForElements.length).toBeGreaterThan(0);

        // Create snapshot
        expect(asFragment()).toMatchSnapshot();
    });
});