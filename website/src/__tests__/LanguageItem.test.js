import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LanguageItem from '../components/language_item';

// Mock the DataLoader component
jest.mock('../utils/dataLoader', () => {
    return ({ file, children }) => {
        const mockData = {
            language_skills: [
                { flag: 'emojione:flag-for-united-states', language: 'English', level: 'Native' },
                { flag: 'twemoji:flag-for-france', language: 'French', level: 'Intermediate' },
                { flag: 'emojione:flag-for-spain', language: 'Spanish', level: 'Beginner' },
            ],
        };
        return children(mockData);
    };
});

test('LanguageItem renders correctly and matches snapshot', () => {
    const { asFragment } = render(<LanguageItem />);
    expect(asFragment()).toMatchSnapshot();
});
