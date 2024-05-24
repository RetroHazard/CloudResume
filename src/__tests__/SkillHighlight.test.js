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
        expect(screen.getByTestId('skill-name-0')).toHaveTextContent('Skill A');
        expect(screen.getByTestId('skill-category-0')).toHaveTextContent('Category A');
        expect(screen.getByTestId('skill-name-1')).toHaveTextContent('Skill B');
        expect(screen.getByTestId('skill-category-1')).toHaveTextContent('Category B');

        // Check if the links are correct
        expect(screen.getByTestId('skill-link-0')).toHaveAttribute('href', 'https://example.com/skillA');
        expect(screen.getByTestId('skill-link-1')).toHaveAttribute('href', 'https://example.com/skillB');

        // Check if the progress bars have correct widths
        expect(screen.getByTestId('skill-progress-0')).toHaveStyle('width: 70%');
        expect(screen.getByTestId('skill-progress-1')).toHaveStyle('width: 85%');

        // Create a snapshot of the rendered component
        expect(container).toMatchSnapshot();
    });
});
