import React from "react";
import { render, screen } from "@testing-library/react";
import Certifications from "../pages/Certifications";
import Education from "../pages/Education";
import Experience from "../pages/Experience";
import Projects from "../pages/Projects";
import Skills from "../pages/Skills";
import CertificationList from "../components/certification_list";
import EducationList from "../components/education_list";
import ExperienceList from "../components/experience_list";
import ProjectList from "../components/project_list";
import SkillHighlight from "../components/skill_highlight";
import SkillButton from "../components/skill_button";
import LanguageItem from "../components/language_item";

// Mock components or functions
jest.mock("../components/certification_list", () => jest.fn());
jest.mock("../components/education_list", () => jest.fn());
jest.mock("../components/experience_list", () => jest.fn());
jest.mock("../components/project_list", () => jest.fn());
jest.mock("../components/skill_highlight", () => jest.fn());
jest.mock("../components/skill_button", () => jest.fn());
jest.mock("../components/language_item", () => jest.fn());

describe("Content Pages", () => {
    test("Certifications page renders correctly, calls CertificationList, and matches snapshot", () => {
        render(<Certifications />);
        expect(screen.getByText("CERTIFICATIONS")).toBeInTheDocument();
        expect(CertificationList).toHaveBeenCalled();
        expect(screen.getByText("CERTIFICATIONS").closest(".content-block")).toMatchSnapshot();
    });

    test("Education page renders correctly, calls EducationList, and matches snapshot", () => {
        render(<Education />);
        expect(screen.getByText("EDUCATION")).toBeInTheDocument();
        expect(EducationList).toHaveBeenCalled();
        expect(screen.getByText("EDUCATION").closest(".content-block")).toMatchSnapshot();
    });

    test("Experience page renders correctly, calls ExperienceList, and matches snapshot", () => {
        render(<Experience />);
        expect(screen.getByText("EXPERIENCE")).toBeInTheDocument();
        expect(ExperienceList).toHaveBeenCalled();
        expect(screen.getByText("EXPERIENCE").closest(".content-block")).toMatchSnapshot();
    });

    test("Projects page renders correctly, calls ProjectList, and matches snapshot", () => {
        render(<Projects />);
        expect(screen.getByText("PROJECTS")).toBeInTheDocument();
        expect(ProjectList).toHaveBeenCalled();
        expect(screen.getByText("PROJECTS").closest(".content-block")).toMatchSnapshot();
    });

    test("Skills page renders correctly, calls SkillHighlight, SkillButton, LanguageItem, and matches snapshot", () => {
        render(<Skills />);
        expect(screen.getByText("SKILLS")).toBeInTheDocument();
        expect(SkillHighlight).toHaveBeenCalled();
        expect(SkillButton).toHaveBeenCalled();
        expect(LanguageItem).toHaveBeenCalled();
        expect(screen.getByText("SKILLS").closest(".content-block")).toMatchSnapshot();
    });

});
