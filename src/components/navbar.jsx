import React from 'react';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse, faGraduationCap, faBriefcase, faChartSimple, faClipboardCheck, faLayerGroup, faMessage } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";


function Navigation() {
    return (
        <>
            <nav className="flex float-left bg-secondary-700 p-2 rounded-lg mr-5 mt-28 h-fit" id="navbar">
                <ul className="flex-col text-sm font-medium text-content-accent">
                    <li>
                        <NavLink to={"/"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-active"><FontAwesomeIcon icon={faHouse}/></i>
                            </div>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/education"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faGraduationCap}/></i>
                            </div>
                            Education
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/experience"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faBriefcase}/></i>
                            </div>
                            Experience
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/skills"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faChartSimple}/></i>
                            </div>
                            Skills
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/certifications"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faClipboardCheck}/></i>
                            </div>
                            Certifications
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/projects"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faLayerGroup}/></i>
                            </div>
                            Projects
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/contact"} className={({ isActive }) =>
                            [
                                isActive ? "nav-block-active" : "nav-block-inactive",
                            ].join(" ")
                        }
                        >
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faMessage}/></i>
                            </div>
                            Contact
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navigation;

;