import { render, screen } from '@testing-library/react';
import PersonalSummary from '../components/personal_summary';
import { parseMarkup } from '../utils/markup';

describe('parseMarkup', () => {
    it('splits **bold** and *italic* runs out of plain text', () => {
        expect(parseMarkup('Expert in **AWS, Terraform**, and *AI governance*.')).toEqual([
            { style: 'plain', text: 'Expert in ' },
            { style: 'bold', text: 'AWS, Terraform' },
            { style: 'plain', text: ', and ' },
            { style: 'italic', text: 'AI governance' },
            { style: 'plain', text: '.' },
        ]);
    });

    it('leaves a lone asterisk as plain text', () => {
        expect(parseMarkup('5 * 3 = 15')).toEqual([{ style: 'plain', text: '5 * 3 = 15' }]);
    });

    it('tolerates missing input', () => {
        expect(parseMarkup(undefined)).toEqual([]);
    });
});

describe('PersonalSummary', () => {
    it('renders one paragraph per entry with emphasis applied', () => {
        const { container } = render(
            <PersonalSummary paragraphs={['Leader with **15+ years**.', 'Going deep on *Game Development*.']} />,
        );
        expect(container.querySelectorAll('p')).toHaveLength(2);
        expect(screen.getByText('15+ years').tagName).toBe('STRONG');
        expect(screen.getByText('Game Development').tagName).toBe('EM');
        // The markup tokens themselves must never leak into the page.
        expect(container.textContent).not.toContain('*');
    });

    it('renders nothing when the data has no summary', () => {
        const { container } = render(<PersonalSummary />);
        expect(container).toBeEmptyDOMElement();
    });
});
