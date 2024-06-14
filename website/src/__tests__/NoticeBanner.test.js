import React from 'react';
import { render } from '@testing-library/react';
import NoticeBanner from '../components/noticebanner';

describe('NoticeBanner Component', () => {
    it('renders correctly in development environment', () => {
        process.env.REACT_APP_DATA_SET = 'development';

        const { getByText } = render(<NoticeBanner />);

        expect(getByText('THIS PAGE IS UNDER CONSTRUCTION')).toBeInTheDocument();
        expect(getByText('SOME FEATURES MAY BE UNAVAILABLE')).toBeInTheDocument();
    });

    it('does not render in non-development environment', () => {
        process.env.REACT_APP_DATA_SET = 'production';

        const { container } = render(<NoticeBanner />);

        expect(container.firstChild).toBeNull();
    });
});
