import { Link } from 'react-router';
import { SectionShell, StatusPill } from '../../components/ui/primitives';

function NotFound() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    return (
        <>
            <title>404 – Page Not Found | Cloud Resume</title>
            <SectionShell
                id='not-found'
                kicker='Service Notice'
                title='Off the Map'
                badge='!'
                line={4}
                right={<StatusPill tone='alert'>Suspended</StatusPill>}
            >
                <div className='flex flex-col items-center gap-5 py-8 text-center'>
                    <p className='font-heading text-7xl font-extrabold tracking-wide text-alert sm:text-8xl'>
                        404
                    </p>
                    <div className='w-full max-w-md rounded border border-dashed border-alert/40 bg-alert/5 px-4 py-3 font-mono text-xs text-content-accent'>
                        <p className='mb-1 uppercase tracking-[0.18em] text-alert'>⚠ No Service</p>
                        <p className='mb-0 tabular'>
                            Line <span className='text-content-subtitle'>{path}</span> does not stop at this station.
                        </p>
                    </div>
                    <Link
                        to='/'
                        className='ticket-button'
                    >
                        <iconify-icon icon='fa6-solid:house' aria-hidden='true' />
                        Return to Concourse
                    </Link>
                </div>
            </SectionShell>
        </>
    );
}

export default NotFound;
