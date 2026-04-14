import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Certifications from '../pages/Certifications';
import Education from '../pages/Education';
import Experience from '../pages/Experience';
import Projects from '../pages/Projects';
import Skills from '../pages/Skills';
import CertificationList from '../components/certification_list';
import EducationList from '../components/education_list';
import ExperienceList from '../components/experience_list';
import ProjectList from '../components/project_list';
import SkillHighlight from '../components/skill_highlight';
import SkillButton from '../components/skill_button';
import LanguageItem from '../components/language_item';

vi.mock('../components/certification_list', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/education_list', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/experience_list', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/project_list', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/skill_highlight', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/skill_button', () => ({ default: vi.fn(() => null) }));
vi.mock('../components/language_item', () => ({ default: vi.fn(() => null) }));

const renderPage = (ui) => render(ui, { wrapper: HelmetProvider });

describe('Content Pages', () => {
    test('Certifications page renders correctly and calls CertificationList', () => {
        renderPage(<Certifications />);
        expect(screen.getByText('Certifications')).toBeInTheDocument();
        expect(CertificationList).toHaveBeenCalled();
    });

    test('Education page renders correctly and calls EducationList', () => {
        renderPage(<Education />);
        expect(screen.getByText('Education')).toBeInTheDocument();
        expect(EducationList).toHaveBeenCalled();
    });

    test('Experience page renders correctly and calls ExperienceList', () => {
        renderPage(<Experience />);
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(ExperienceList).toHaveBeenCalled();
    });

    test('Projects page renders correctly and calls ProjectList', () => {
        renderPage(<Projects />);
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(ProjectList).toHaveBeenCalled();
    });

    test('Skills page renders correctly and calls skill components', () => {
        renderPage(<Skills />);
        expect(screen.getByText('Skills')).toBeInTheDocument();
        expect(SkillHighlight).toHaveBeenCalled();
        expect(SkillButton).toHaveBeenCalled();
        expect(LanguageItem).toHaveBeenCalled();
    });
});
