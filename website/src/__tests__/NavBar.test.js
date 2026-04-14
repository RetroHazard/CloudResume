import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navigation from '../components/navbar';

vi.mock('../components/visitor_count', () => ({ default: () => null }));

describe('Navigation component', () => {
    it('renders all navigation links', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='*' element={<Navigation />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(getByText('Home')).toBeInTheDocument();
        expect(getByText('Education')).toBeInTheDocument();
        expect(getByText('Experience')).toBeInTheDocument();
        expect(getByText('Certifications')).toBeInTheDocument();
        expect(getByText('Projects')).toBeInTheDocument();
        expect(getByText('Skills')).toBeInTheDocument();
        expect(getByText('Contact')).toBeInTheDocument();
    });

    it('nav has accessible name', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='*' element={<Navigation />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    });
});
