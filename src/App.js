import React from "react"
import { Route, Routes } from "react-router-dom"
// We will create these two pages in a moment
import Home from "./pages/Home"
import Education from "./pages/Education"
import Experience from "./pages/Experience"
import Skills from "./pages/Skills"
import Projects from "./pages/Projects"
import Certifications from "./pages/Certifications"
import Contact from "./pages/Contact"
export default function App() {
  return (
    <Routes>
      <Route exact path="/" component={Home} />
      <Route path="/:id" component={Education} />
      <Route path="/:id" component={Experience} />
      <Route path="/:id" component={Skills} />
      <Route path="/:id" component={Projects} />
      <Route path="/:id" component={Certifications} />
      <Route path="/:id" component={Contact} />
    </Routes>
  )
}