import React from 'react';
import { render } from '@testing-library/react';
import SkillButton from '../components/skill_button';

jest.mock('../utils/dataLoader', () => ({
    __esModule: true,
    default: ({ children }) =>
        children({
            target_skills: [
                { name: 'Skill 1', website: 'https://skill1.com', logo: 'skill1-icon' },
                { name: 'Skill 2', website: 'https://skill2.com', logo: 'skill2-icon' },
                // Add more mock skills as needed
            ]
        })
}));

describe('SkillButton', () => {
    it('renders skill buttons with correct data', () => {
        const skills = [
            { name: 'Skill 1', website: 'https://skill1.com', logo: 'skill1-icon' },
            { name: 'Skill 2', website: 'https://skill2.com', logo: 'skill2-icon' }
        ];
        const { asFragment } = render(<SkillButton skills={skills} />);

        // Check if skill buttons are rendered with correct data
        expect(asFragment()).toMatchSnapshot();
    });

    // Manual snapshot for review
    it('should match manual snapshot', () => {
        const skills = [
            { name: 'Skill 1', website: 'https://skill1.com', logo: 'skill1-icon' },
            { name: 'Skill 2', website: 'https://skill2.com', logo: 'skill2-icon' }
        ];
        const { asFragment } = render(<SkillButton skills={skills} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
