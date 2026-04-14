// website/src/__tests__/NavBar.test.js
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navigation from '../components/navbar';

vi.mock('../components/visitor_count', () => ({ default: () => null }));

describe('Navigation component', () => {
    it('renders all navigation links', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='*' element={<Navigation />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Education')).toBeInTheDocument();
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(screen.getByText('Certifications')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
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

    it('active link has active class, inactive links do not', () => {
        render(
            <MemoryRouter initialEntries={['/education']}>
                <Routes>
                    <Route path='*' element={<Navigation />} />
                </Routes>
            </MemoryRouter>,
        );
        const educationLink = screen.getByRole('link', { name: /education/i });
        const homeLink = screen.getByRole('link', { name: /home/i });
        expect(educationLink).toHaveClass('nav-block-active');
        expect(homeLink).toHaveClass('nav-block-inactive');
    });
});
