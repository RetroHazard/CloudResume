import React from "react"

// Import Components
import Navigation from "./components/navbar"

// Import Content Pages
import Home from "./pages/Home"
import Education from "./pages/Education";
/* 
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
      <Navigation />
      <div className="px-2 py-20 space-y-8 max-w-5xl">
        <section id="content">
        <Education />
        </section>
      </div>
    </div>
    </>
  )
}