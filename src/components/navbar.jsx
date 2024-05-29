import React from 'react';
import { NavLink } from "react-router-dom";

import {Icon} from "@iconify-icon/react";

async function get_visitors() {
    try {
        // Generate or retrieve a unique identifier for the visitor
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem('visitorId', visitorId);
        }

        // Send the visitorId as a query parameter
        let response = await fetch(`https://api.cloudresume-agb.jp/dev/visitors?visitorId=${visitorId}`, {
            method: 'GET',
        });

        let data = await response.json();
        document.getElementById("visitors").innerHTML = data['count'];
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}
get_visitors();


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
                        <div className="inline-flex items-center px-4 py-1 mt-1 mb-1 bg-secondary-700 w-full">
                            <i className="icon-box">
                                <Icon icon="fa6-solid:users"/>
                            </i>
                            <span className="text-base font-sans" id="visitors" />
                        </div>
                    </li>
                </ul>
            </nav>

        </>
    )
}

export default Navigation;