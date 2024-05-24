import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ExperienceList from '../components/experience_list';

// Sample JSON data
const sampleData = {
    Experience: [
        {
            company: "Generic Company",
            job_title: "Generic Job Title",
            location: "Generic Location",
            type: "Generic Type",
            start: "Generic Start",
            end: "Generic End",
            logo: "./images/placeholder.png",
            website: "https://genericwebsite.com",
            details: [
                "Generic detail 1",
                "Generic detail 2",
                "Generic detail 3",
                "Generic detail 4"
            ],
            technologies: [
                {
                    name: "Generic Skill 1",
                    logo: "ph:placeholder-fill",
                    website: "https://genericskill1.com"
                },
                {
                    name: "Generic Skill 2",
                    logo: "ph:placeholder-fill",
                    website: "https://genericskill2.com"
                },
                {
                    name: "Generic Skill 3",
                    logo: "ph:placeholder-fill",
                    website: "https://genericskill3.com"
                },
                {
                    name: "Generic Skill 4",
                    logo: "ph:placeholder-fill",
                    website: "https://genericskill4.com"
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

describe('ExperienceList Component', () => {
    it('renders correctly', () => {
        const { getByText, getByAltText } = render(<ExperienceList />);

        expect(getByText('Generic Job Title')).toBeInTheDocument();
        expect(getByText('Generic Company')).toBeInTheDocument();
        expect(getByText('Generic Type')).toBeInTheDocument();
        expect(getByText('Generic Start - Generic End')).toBeInTheDocument();
        expect(getByText('Generic Location')).toBeInTheDocument();
        expect(getByAltText('Generic Company logo')).toBeInTheDocument();

        sampleData.Experience[0].details.forEach(detail => {
            expect(getByText(detail)).toBeInTheDocument();
        });

        sampleData.Experience[0].technologies.forEach(skill => {
            expect(getByText(skill.name)).toBeInTheDocument();
        });
    });

    it('matches snapshot', () => {
        const { container } = render(<ExperienceList />);
        expect(container).toMatchSnapshot();
    });
});
