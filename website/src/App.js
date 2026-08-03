// website/src/App.js
import { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter, useLocation } from 'react-router';
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
        // The outer boundary covers the chrome — background, header, nav — which
        // the inner one around the routes does not. Anything that throws out
        // there used to unmount the entire tree and leave a blank document; now
        // the worst case is a page that says so and offers a way back.
        <ErrorBoundary>
            <MotionConfig reducedMotion='user'>
                <TransitBackground />
                <StationHeader />
                <a
                    href='#content'
                    className='sr-only focus:not-sr-only focus:absolute focus:top-14 focus:left-2 focus:z-50 focus:rounded focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-secondary-900'
                >
                    Skip to main content
                </a>
                <BrowserRouter>
                    <NoticeBanner />
                    {/* Below `sm` the rail map collapses to a horizontal strip above the
                        board; from `sm` up it returns to the left-hand line map. */}
                    <div className='mx-auto flex max-w-6xl flex-col items-stretch px-3 max-sm:pt-16 sm:flex-row sm:items-start sm:justify-center sm:px-0'>
                        <Navigation />
                        <div className='w-full max-w-2xl space-y-8 max-sm:mx-auto max-sm:pt-6 max-sm:pb-12 sm:w-3/5 sm:min-w-102 sm:px-2 sm:py-20'>
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
        </ErrorBoundary>
    );
}
