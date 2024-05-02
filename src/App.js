import React from "react"

/* 
import Home from "./pages/Home"
import Education from "./pages/Education"
import Experience from "./pages/Experience"
import Skills from "./pages/Skills"
import Projects from "./pages/Projects"
import Certifications from "./pages/Certifications"
import Contact from "./pages/Contact" 
*/

export default function App() {
  return (
    <>
    <div className="flex justify-center">
      {/* TODO - NAV BAR SECTION */}
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


      <h1>Here, is there something here?</h1>
      <div className="px-2 py-20 space-y-8 max-w-5xl">
        {/* TODO - MAIN CONTENT SECTION */}
        <h1>What about here?</h1>
      </div>
    </div>
    </>
  )
}