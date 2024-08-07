import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

// Import Navigation
import Navigation from './components/navbar';
import NoticeBanner from './components/noticebanner';

// Import Content Pages
import Home from './pages/Home';
import Education from './pages/Education';
import Experience from './pages/Experience';
import Certifications from './pages/Certifications';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

export default function App() {
    return (
        <>
            <NoticeBanner />
            <BrowserRouter>
                <div className='flex justify-center'>
                    <Navigation />
                    <div className='min-w-102 w-3/5 max-w-2xl flex-shrink space-y-8 px-2 py-20'>
                        <section id='content'>
                            <Routes>
                                <Route path='/' element={<Home />} />
                                <Route path='/education' element={<Education />} />
                                <Route path='/experience' element={<Experience />} />
                                <Route path='/certifications' element={<Certifications />} />
                                <Route path='/skills' element={<Skills />} />
                                <Route path='/projects' element={<Projects />} />
                                <Route path='/contact' element={<Contact />} />
                            </Routes>
                        </section>
                    </div>
                </div>
            </BrowserRouter>
        </>
    );
}
