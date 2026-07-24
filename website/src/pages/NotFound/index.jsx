import { Link } from 'react-router-dom';
import { SectionShell } from '../../components/ui/primitives';

function NotFound() {
    return (
        <>
            <title>404 – Page Not Found | Cloud Resume</title>
            <SectionShell id='not-found' kicker='// status: 404'>
                <div className='flex flex-col items-center gap-4 py-10 text-center'>
                    <p className='font-mono text-6xl font-bold text-neon sm:text-7xl'>404</p>
                    <h1 className='mb-0 font-heading text-2xl font-bold text-content-header'>
                        Route not found
                    </h1>
                    <p className='max-w-md font-mono text-sm text-content-accent'>
                        <span className='text-glow'>$</span> curl {typeof window !== 'undefined' ? window.location.pathname : '/'} → 404
                        <br />
                        The resource you requested does not exist on this host.
                    </p>
                    <Link
                        to='/'
                        className='mt-2 inline-flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-4 py-2 font-mono text-sm text-neon no-underline transition-colors hover:bg-neon/20'
                    >
                        cd ~/home
                    </Link>
                </div>
            </SectionShell>
        </>
    );
}

export default NotFound;
