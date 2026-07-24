// website/src/App.js
import { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';

import Navigation from './components/navbar';
import NoticeBanner from './components/noticebanner';
import ErrorBoundary from './components/ErrorBoundary';
import TransitBackground from './components/TransitBackground';
import StationHeader from './components/station_header';
import { LoadingSkeleton } from './utils/useJsonData';

// Eager: small, immediately needed
import Home from './pages/Home';
import Education from './pages/Education';
import Experience from './pages/Experience';
import Certifications from './pages/Certifications';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import NotFound from './pages/NotFound';

// Lazy: large bundle (reCAPTCHA ~50KB gzip)
const Contact = lazy(() => import('./pages/Contact'));

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
                <Routes location={location}>
                    <Route path='/' element={<Home />} />
                    <Route path='/education' element={<Education />} />
                    <Route path='/experience' element={<Experience />} />
                    <Route path='/certifications' element={<Certifications />} />
                    <Route path='/skills' element={<Skills />} />
                    <Route path='/projects' element={<Projects />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <MotionConfig reducedMotion='user'>
            <TransitBackground />
            <StationHeader />
            <a
                href='#content'
                className='sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-14 focus:z-50 focus:rounded focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-secondary-900'
            >
                Skip to main content
            </a>
            <BrowserRouter>
                <NoticeBanner />
                <div className='mx-auto flex max-w-6xl justify-center'>
                    <Navigation />
                    <div className='sm:min-w-102 w-3/5 max-w-2xl space-y-8 px-2 py-20'>
                        <ErrorBoundary>
                            <Suspense fallback={<LoadingSkeleton />}>
                                <main id='content' tabIndex={-1} className='outline-none'>
                                    <AnimatedRoutes />
                                </main>
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            </BrowserRouter>
        </MotionConfig>
    );
}
