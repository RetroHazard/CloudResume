// website/src/App.js
import { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Navigation from './components/navbar';
import NoticeBanner from './components/noticebanner';
import ErrorBoundary from './components/ErrorBoundary';
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

export default function App() {
    return (
        <HelmetProvider>
            <a
                href='#content'
                className='sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-secondary-900'
            >
                Skip to main content
            </a>
            <BrowserRouter>
                <NoticeBanner />
                <div className='flex justify-center'>
                    <Navigation />
                    <div className='sm:min-w-102 w-3/5 max-w-2xl flex-shrink space-y-8 px-2 py-20'>
                        <ErrorBoundary>
                            <Suspense fallback={<LoadingSkeleton />}>
                                <main id='content' tabIndex={-1}>
                                    <Routes>
                                        <Route path='/' element={<Home />} />
                                        <Route path='/education' element={<Education />} />
                                        <Route path='/experience' element={<Experience />} />
                                        <Route path='/certifications' element={<Certifications />} />
                                        <Route path='/skills' element={<Skills />} />
                                        <Route path='/projects' element={<Projects />} />
                                        <Route path='/contact' element={<Contact />} />
                                        <Route path='*' element={<NotFound />} />
                                    </Routes>
                                </main>
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            </BrowserRouter>
        </HelmetProvider>
    );
}
