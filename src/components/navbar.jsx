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
                        <NavLink to={"/"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}
                        >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faHouse}/></i>
                            </div>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/education"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                        <div className="icon-box">
                                <i><FontAwesomeIcon icon={faGraduationCap}/></i>
                            </div>
                            Education
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/experience"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faBriefcase}/></i>
                            </div>
                            Experience
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/skills"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faChartSimple}/></i>
                            </div>
                            Skills
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/certifications"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faClipboardCheck}/></i>
                            </div>
                            Certifications
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/projects"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faLayerGroup}/></i>
                            </div>
                            Projects
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/contact"} className={({ isActive }) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                    }}
                    >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faMessage}/></i>
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