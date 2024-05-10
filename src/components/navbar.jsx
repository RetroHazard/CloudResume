import React from 'react';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse, faGraduationCap, faBriefcase, faChartSimple, faClipboardCheck, faLayerGroup, faMessage, faUsers } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

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
                        }}
                        >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faHouse}/></i>
                            </div>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={"/education"} className={({isActive}) => {
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
                        <NavLink to={"/experience"} className={({isActive}) => {
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
                        <NavLink to={"/skills"} className={({isActive}) => {
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
                        <NavLink to={"/certifications"} className={({isActive}) => {
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
                        <NavLink to={"/projects"} className={({isActive}) => {
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
                        <NavLink to={"/contact"} className={({isActive}) => {
                            return isActive ? "nav-block-active" : "nav-block-inactive";
                        }}
                        >
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faMessage}/></i>
                            </div>
                            Contact
                        </NavLink>
                    </li>
                    <div className="justify-between bg-secondary-600 h-0.5 mt-2 mb-2 w-full"></div>
                    <li className="flex-col text-sm font-medium text-content-accent">
                        <div className="inline-flex items-center px-4 py-1 mt-1 mb-1 bg-secondary-700 w-full">
                            <div className="icon-box">
                                <i><FontAwesomeIcon icon={faUsers}/></i>
                            </div>
                            <span className="text-base font-sans" id="visitors"></span>
                        </div>
                    </li>
                </ul>
            </nav>

        </>
    )
}

export default Navigation;

;