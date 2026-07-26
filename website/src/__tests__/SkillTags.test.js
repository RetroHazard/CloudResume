import { render, screen } from '@testing-library/react';
import SkillTags from '../components/skill_tags';

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: {
            industry_knowledge: [{ name: 'Identity & Access Management' }, { name: 'Zero Trust' }],
            soft_skills: [{ name: 'Mentoring' }],
        },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

describe('SkillTags', () => {
    test('renders items from the given data key', () => {
        render(<SkillTags dataKey='industry_knowledge' />);
        expect(screen.getByText('Identity & Access Management')).toBeInTheDocument();
        expect(screen.getByText('Zero Trust')).toBeInTheDocument();
        expect(screen.queryByText('Mentoring')).not.toBeInTheDocument();
    });

    test('prefers an explicit items prop over the data key', () => {
        render(<SkillTags items={[{ name: 'Custom Tag' }]} />);
        expect(screen.getByText('Custom Tag')).toBeInTheDocument();
    });
});
