import { render } from '@testing-library/react';
import LanguageItem from '../components/language_item';

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: {
            language_skills: [
                { flag: 'emojione:flag-for-united-states', language: 'English', level: 'Native' },
                { flag: 'twemoji:flag-for-france', language: 'French', level: 'Intermediate' },
                { flag: 'emojione:flag-for-spain', language: 'Spanish', level: 'Beginner' },
            ],
        },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

test('LanguageItem renders correctly and matches snapshot', () => {
    const { asFragment } = render(<LanguageItem />);
    expect(asFragment()).toMatchSnapshot();
});
