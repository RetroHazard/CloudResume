import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProjectList from '../components/project_list';

// Sample JSON data
const sampleData = {
    Projects: [
        {
            name: 'Generic Project',
            company: 'Generic Company',
            category: 'Generic Category',
            role: 'Generic Role',
            start: '2020',
            end: '2021',
            logo: './images/generic_logo.png',
            details: [
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
                'Nisi ut aliquip ex ea commodo consequat.',
            ],
            links: [
                {
                    demo: [
                        {
                            website: 'https://generic-demo.com',
                            icon: 'fa-solid:external-link-alt',
                        },
                    ],
                    repo: [
                        {
                            website: 'https://generic-repo.com',
                            icon: 'simple-icons:git',
                        },
                    ],
                    spec: [
                        {
                            website: 'https://generic-spec.com',
                            icon: 'fa6-solid:info',
                        },
                    ],
                },
            ],
            technologies: [
                {
                    name: 'Generic Skill 1',
                    logo: 'ph:generic-icon-1',
                    website: 'https://generic-skill1.com',
                },
                {
                    name: 'Generic Skill 2',
                    logo: 'ph:generic-icon-2',
                    website: 'https://generic-skill2.com',
                },
                {
                    name: 'Generic Skill 3',
                    logo: 'ph:generic-icon-3',
                    website: 'https://generic-skill3.com',
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

describe('ProjectList Component', () => {
    it('renders correctly', () => {
        const { getByText, getByAltText, getAllByRole } = render(<ProjectList />);

        expect(getByText('Generic Project')).toBeInTheDocument();
        expect(getByText('Generic Company')).toBeInTheDocument();
        expect(getByText('Generic Category')).toBeInTheDocument();
        expect(getByText('Generic Role')).toBeInTheDocument();
        expect(getByText('2020 - 2021')).toBeInTheDocument();
        expect(getByAltText('Generic Project logo')).toBeInTheDocument();

        sampleData.Projects[0].details.forEach((detail) => {
            expect(getByText(detail)).toBeInTheDocument();
        });

        const links = getAllByRole('link');
        expect(links.length).toBe(6);

        sampleData.Projects[0].technologies.forEach((skill) => {
            expect(getByText(skill.name)).toBeInTheDocument();
        });
    });

    it('matches snapshot', () => {
        const { container } = render(<ProjectList />);
        expect(container).toMatchSnapshot();
    });
});
