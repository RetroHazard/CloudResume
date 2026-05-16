import { render } from '@testing-library/react';
import NoticeBanner from '../components/noticebanner';

describe('NoticeBanner Component', () => {
    it('renders in development environment with sentence-case text', () => {
        vi.stubEnv('VITE_DATA_SET', 'development');
        const { getByText } = render(<NoticeBanner />);
        expect(getByText('This page is under construction')).toBeInTheDocument();
        expect(getByText('Some features may be unavailable')).toBeInTheDocument();
    });

    it('does not render in production environment', () => {
        vi.stubEnv('VITE_DATA_SET', 'production');
        const { container } = render(<NoticeBanner />);
        expect(container.firstChild).toBeNull();
    });
});
