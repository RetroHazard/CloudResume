import { render, screen } from '@testing-library/react';
import SkillButton from '../components/skill_button';

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: { target_skills: [] },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

const skills = [
    { name: 'Skill 1', website: 'https://skill1.com', logo: 'skill1-icon' },
    { name: 'Skill 2', website: 'https://skill2.com', logo: 'skill2-icon' },
];

describe('SkillButton', () => {
    it('renders skill buttons with provided skills prop (no data load)', () => {
        render(<SkillButton skills={skills} />);
        expect(screen.getByText('Skill 1')).toBeInTheDocument();
        expect(screen.getByText('Skill 2')).toBeInTheDocument();
    });

    it('matches snapshot with skills prop', () => {
        const { asFragment } = render(<SkillButton skills={skills} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
