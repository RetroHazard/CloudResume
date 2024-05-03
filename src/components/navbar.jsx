import React from 'react';
// import { useState } from 'react'

function navbar() {
    return (
    <>
    <nav className="flex float-left bg-secondary-700 p-2 rounded-lg mr-5 mt-28 h-fit" id="navbar">
        <ul className="flex-col text-sm font-medium text-content-accent">
            <li>
                <a href="#" className="nav-block-active" aria-current="page">
                    <i className="nav-icon-active fas fa-house"></i>
                    Home
                </a>
            </li>
            <li>
                <a href="#" className="nav-block-inactive">
                    <i className="nav-icon-inactive fas fa-graduation-cap"></i>
                    Education
                </a>
            </li>
            <li>
                <a href="#" className="nav-block-inactive">
                    <i className="nav-icon-inactive fas fa-briefcase"></i>
                    Experience
                </a>
            </li>
            <li>
                <a href="#" className="nav-block-inactive">
                    <i className="nav-icon-inactive fas fa-chart-simple"></i>
                    Skills
                </a>
            </li>
            <li>
                <a href="#" className="nav-block-inactive">
                    <i className="nav-icon-inactive fas fa-clipboard-check"></i>
                    Certifications
                </a>
            </li>
            <li>
                <a href="#" className="nav-block-inactive">
                    <i className="nav-icon-inactive fas fa-layer-group"></i>
                    Projects
                </a>
            </li>
        </ul>
    </nav>
    </>
    )
}

export default navbar;

;