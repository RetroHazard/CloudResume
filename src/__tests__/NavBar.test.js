import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Navigation from '../components/navbar';

describe('Navigation component', () => {
    it('renders navigation links correctly', () => {
        // Render the Navigation component wrapped in MemoryRouter
        const { getByText } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='*' element={<Navigation />} />
                </Routes>
            </MemoryRouter>,
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
});
