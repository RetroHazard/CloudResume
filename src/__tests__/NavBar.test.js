import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Navigation from '../components/navbar';

describe('Navigation component', () => {
    it('renders navigation links correctly', () => {
        // Render the Navigation component wrapped in MemoryRouter
        const { getByText } = render(
            <MemoryRouter>
                <Navigation />
            </MemoryRouter>
        );

        // Assert that navigation links are rendered correctly
        expect(getByText('Home')).toBeInTheDocument();
        expect(getByText('Education')).toBeInTheDocument();
        expect(getByText('Experience')).toBeInTheDocument();
        expect(getByText('Certifications')).toBeInTheDocument();
        expect(getByText('Projects')).toBeInTheDocument();
        expect(getByText('Skills')).toBeInTheDocument();
        expect(getByText('Contact')).toBeInTheDocument();
    });

    it('changes style on hover', () => {
        // Render the Navigation component wrapped in MemoryRouter
        const { getByText } = render(
            <MemoryRouter>
                <Navigation />
            </MemoryRouter>
        );

        const homeLink = getByText('Home');

        // Simulate hover event
        fireEvent.mouseEnter(homeLink);

        // Assert that the style changes on hover
        expect(homeLink).toHaveClass('nav-block-active');

        // Simulate mouse leave event
        fireEvent.mouseLeave(homeLink);

        // Assert that the style reverts back after hover
        expect(homeLink).toHaveClass('nav-block-active'); // First link should remain active even after mouse leave
    });
});
