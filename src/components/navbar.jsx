import React from 'react';
import { NavLink } from "react-router-dom";

import {Icon} from "@iconify-icon/react";

import VisitorCount from "./visitor_count";

function Navigation() {
    return (
        <>
            <nav className="flex float-left bg-secondary-700 p-2 rounded-lg mr-5 mt-28 h-fit" id="navbar">
                <ul className="flex-col text-sm font-medium text-content-accent">
                    <li>
                        <NavLink to={"/"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:house"/>
                            </i>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/education"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:graduation-cap"/>
                            </i>
                            Education
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/experience"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:briefcase"/>
                            </i>
                            Experience
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/certifications"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:certificate"/>
                            </i>
                            Certifications
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/projects"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:layer-group"/>
                            </i>
                            Projects
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/skills"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:chart-simple"/>
                            </i>
                            Skills
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/contact"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <Icon icon="fa6-solid:message"/>
                            </i>
                            Contact
                        </NavLink>
                    </li>
                    <div className="justify-between bg-secondary-600 h-0.5 mt-2 mb-2 w-full"></div>
                    <li className="flex-col text-sm font-medium text-content-accent">
                        <VisitorCount/>
                    </li>
                </ul>
            </nav>

        </>
    )
}

export default Navigation;