import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EducationList from '../components/education_list';

// Sample JSON data
const sampleData = {
    Education: [
        {
            school: "Sample University",
            degree: "BSc. Sample Degree",
            location: "Sample City, Country",
            category: "Sample Category",
            start: "2000",
            end: "2004",
            logo: "./images/placeholder.png",
            details: [
                "Sample detail 1",
                "Sample detail 2",
                "Sample detail 3",
                "Sample detail 4"
            ],
            links: [
                {
                    program: [
                        {
                            website: "https://sampleprogram.com",
                            icon: "fa6-solid:circle-info"
                        }
                    ],
                    school: [
                        {
                            website: "https://sampleuniversity.com",
                            icon: "fa6-solid:globe"
                        }
                    ]
                }
            ]
        }
    ]
};

// Mock the DataLoader component
jest.mock('../utils/dataLoader', () => ({
    __esModule: true,
    default: ({ children }) => children(sampleData),
}));

describe('EducationList Component', () => {
    it('renders correctly', () => {
        const { getByText, getByAltText, getAllByRole } = render(<EducationList />);

        // Check for education details
        expect(getByText('Sample University')).toBeInTheDocument();
        expect(getByText('BSc. Sample Degree')).toBeInTheDocument();
        expect(getByText('Sample Category')).toBeInTheDocument();
        expect(getByText('2000 - 2004')).toBeInTheDocument();
        expect(getByText('Sample City, Country')).toBeInTheDocument();
        expect(getByAltText('Sample University Logo')).toBeInTheDocument();

        // Check for details
        sampleData.Education[0].details.forEach(detail => {
            expect(getByText(detail)).toBeInTheDocument();
        });

        // Check for links
        const links = getAllByRole('link');
        expect(links).toHaveLength(2); // Expecting 2 links

        expect(links[0]).toHaveAttribute('href', 'https://sampleprogram.com');
        expect(links[1]).toHaveAttribute('href', 'https://sampleuniversity.com');
    });

    it('matches snapshot', () => {
        const { container } = render(<EducationList />);
        expect(container).toMatchSnapshot();
    });
});
