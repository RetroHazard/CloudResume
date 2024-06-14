import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SkillHighlight from '../components/skill_highlight';

// Mock the DataLoader component
jest.mock('../utils/dataLoader', () => ({
    __esModule: true,
    default: ({ file, children }) => children({
        core_skills: [
            {
                name: 'Skill A',
                category: 'Category A',
                level: '70%',
                logo: 'logos:skillA',
                website: 'https://example.com/skillA'
            },
            {
                name: 'Skill B',
                category: 'Category B',
                level: '85%',
                logo: 'logos:skillB',
                website: 'https://example.com/skillB'
            }
        ]
    })
}));

describe('SkillHighlight', () => {
    test('renders the skill data correctly and matches snapshot', () => {
        const { container } = render(<SkillHighlight />);

        // Check if the skills are rendered
        expect(screen.getByText('Skill A')).toBeInTheDocument();
        expect(screen.getByText('Category A')).toBeInTheDocument();
        expect(screen.getByText('Skill B')).toBeInTheDocument();
        expect(screen.getByText('Category B')).toBeInTheDocument();

        // Check if the links are correct
        expect(screen.getByText('Skill A').closest('a')).toHaveAttribute('href', 'https://example.com/skillA');
        expect(screen.getByText('Skill B').closest('a')).toHaveAttribute('href', 'https://example.com/skillB');

        // Check if the progress bars have correct widths
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars[0]).toHaveStyle('width: 70%');
        expect(progressBars[1]).toHaveStyle('width: 85%');

        // Create a snapshot of the rendered component
        expect(container).toMatchSnapshot();
    });
});
