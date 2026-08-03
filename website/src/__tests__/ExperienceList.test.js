import { render } from '@testing-library/react';
import ExperienceList from '../components/experience_list';
import { useJsonData } from '../utils/useJsonData';

// An employer held across a promotion: one entry, a newest-first `roles` array,
// company facts hoisted to the top level.
const promotionEntry = {
    company: 'Promoting Company',
    location: 'Promoting Location',
    type: 'Promoting Type',
    logo: './images/placeholder.png',
    website: 'https://promotingwebsite.com',
    roles: [
        {
            job_title: 'Senior Generic Title',
            transition: 'Promoted',
            start: '2023-01',
            end: '2025-09',
            details: ['Senior detail 1', 'Senior detail 2'],
            technologies: [{ name: 'Senior Skill', logo: 'ph:placeholder-fill', website: 'https://seniorskill.com' }],
        },
        {
            job_title: 'Junior Generic Title',
            start: '2021-04',
            end: '2023-01',
            details: ['Junior detail 1', 'Junior detail 2'],
            technologies: [{ name: 'Junior Skill', logo: 'ph:placeholder-fill', website: 'https://juniorskill.com' }],
        },
    ],
};

// Sample JSON data
const sampleData = {
    Experience: [
        {
            company: 'Generic Company',
            job_title: 'Generic Job Title',
            location: 'Generic Location',
            type: 'Generic Type',
            start: 'Generic Start',
            end: 'Generic End',
            logo: './images/placeholder.png',
            website: 'https://genericwebsite.com',
            details: ['Generic detail 1', 'Generic detail 2', 'Generic detail 3', 'Generic detail 4'],
            technologies: [
                {
                    name: 'Generic Skill 1',
                    logo: 'ph:placeholder-fill',
                    website: 'https://genericskill1.com',
                },
                {
                    name: 'Generic Skill 2',
                    logo: 'ph:placeholder-fill',
                    website: 'https://genericskill2.com',
                },
                {
                    name: 'Generic Skill 3',
                    logo: 'ph:placeholder-fill',
                    website: 'https://genericskill3.com',
                },
                {
                    name: 'Generic Skill 4',
                    logo: 'ph:placeholder-fill',
                    website: 'https://genericskill4.com',
                },
            ],
        },
    ],
};

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: sampleData, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));

describe('ExperienceList Component', () => {
    it('renders correctly', () => {
        const { getByText, container } = render(<ExperienceList />);

        expect(getByText('Generic Job Title')).toBeInTheDocument();
        expect(getByText('Generic Company')).toBeInTheDocument();
        expect(getByText('Generic Type')).toBeInTheDocument();
        expect(getByText('Generic Start — Generic End')).toBeInTheDocument();
        expect(getByText('Generic Location')).toBeInTheDocument();
        expect(container.querySelector('img[alt=""]')).toBeInTheDocument();

        sampleData.Experience[0].details.forEach((detail) => {
            expect(getByText(detail)).toBeInTheDocument();
        });

        sampleData.Experience[0].technologies.forEach((skill) => {
            expect(getByText(skill.name)).toBeInTheDocument();
        });
    });

    it('matches snapshot', () => {
        const { container } = render(<ExperienceList />);
        expect(container).toMatchSnapshot();
    });

    it('renders an employer held across a promotion as a single row', () => {
        useJsonData.mockReturnValueOnce({
            data: { Experience: [promotionEntry] },
            loading: false,
            error: null,
        });
        const { getAllByText, getByText, getByTitle } = render(<ExperienceList />);

        // One board row, advertising the most recent title.
        expect(getAllByText('Promoting Company')).toHaveLength(1);
        expect(getByTitle('Senior Generic Title')).toBeInTheDocument();
        expect(getByText('2 Roles')).toBeInTheDocument();

        // The row spans the whole tenure, and each role keeps its own dates,
        // bullets and skills.
        expect(getByText('2021-04 — 2025-09')).toBeInTheDocument();
        expect(getByText('2023-01 — 2025-09')).toBeInTheDocument();
        expect(getByText('2021-04 — 2023-01')).toBeInTheDocument();
        expect(getByText('Junior Generic Title')).toBeInTheDocument();
        expect(getByText('Senior detail 1')).toBeInTheDocument();
        expect(getByText('Junior detail 2')).toBeInTheDocument();
        expect(getByText('Senior Skill')).toBeInTheDocument();
        expect(getByText('Junior Skill')).toBeInTheDocument();

        // The transition marker is dated by the role it leads into.
        expect(getByText(/Promoted/)).toHaveTextContent('Promoted · 2023-01');
    });

    it('leaves the transition marker off a role that declares no transition', () => {
        const [senior, junior] = promotionEntry.roles;
        useJsonData.mockReturnValueOnce({
            data: { Experience: [{ ...promotionEntry, roles: [{ ...senior, transition: undefined }, junior] }] },
            loading: false,
            error: null,
        });
        const { queryByText } = render(<ExperienceList />);

        expect(queryByText(/Promoted/)).not.toBeInTheDocument();
        expect(queryByText('Junior Generic Title')).toBeInTheDocument();
    });
});
