import React from 'react';
import { NavLink } from "react-router-dom";

import {Icon} from "@iconify-icon/react";

// GET API REQUEST
async function get_visitors() {
    // call post api request function
    //await post_visitor();
    try {
        let response = await fetch('https://knr52endfj.execute-api.ap-northeast-1.amazonaws.com/default/visitorCounter', {
            method: 'GET',
        });
        let data = await response.json()
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
                            <iconify-icon inline="" icon="fa6-solid:house"/>
                        </i>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/education"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:graduation-cap"/>
                            </i>
                                Education
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/experience"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:briefcase"/>
                            </i>
                            Experience
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/skills"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:chart-simple"/>
                            </i>
                            Skills
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/certifications"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:certificate"/>
                            </i>
                            Certifications
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/projects"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:layer-group"/>
                            </i>
                            Projects
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/contact"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}>
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:message"/>
                            </i>
                            Contact
                        </NavLink>
                    </li>
                    <div className="justify-between bg-secondary-600 h-0.5 mt-2 mb-2 w-full"></div>
                    <li className="flex-col text-sm font-medium text-content-accent">
                        <div className="inline-flex items-center px-4 py-1 mt-1 mb-1 bg-secondary-700 w-full">
                            <i className="icon-box">
                                <iconify-icon inline="" icon="fa6-solid:users"/>
                            </i>
                            <span className="text-base font-sans" id="visitors"></span>
                        </div>
                    </li>
                </ul>
            </nav>

        </>
    )
}

export default Navigation;