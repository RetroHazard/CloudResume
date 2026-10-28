// website/src/components/visitor_count.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import { useVisitorId } from '../utils/useVisitorId';
import { apiGet } from '../utils/apiClient';

function VisitorCount() {
    const [visitors, setVisitors] = useState(null);
    const [error, setError] = useState(null);
    const visitorId = useVisitorId();

    useEffect(() => {
        const controller = new AbortController();
        apiGet('/visitors', { visitorId }, controller.signal)
            .then((data) => setVisitors(data['count']))
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('Visitor count fetch failed:', err);
                    setError(true);
                }
            });
        return () => controller.abort();
    }, [visitorId]);

    if (error) return null;

    return (
        <div
            className='relative my-0.5 inline-flex w-full items-center gap-3 px-3 py-2.5 text-content-accent max-sm:hidden'
            role='status'
            aria-live='polite'
            aria-atomic='true'
        >
            {/* grey terminus node, laid out like a station stop so the icon and
                count line up with the nav items above and the rail ends here */}
            <span
                aria-hidden='true'
                className='relative z-10 h-4 w-4 shrink-0 rounded-full border-2 border-secondary-400 bg-background'
            />
            <i className='icon-box h-4 w-4 text-sm' aria-hidden='true'>
                <Icon icon='fa6-solid:users' />
            </i>
            <span className='font-sans text-base leading-4'>
                <span className='sr-only'>Site visitors: </span>
                {visitors !== null ? visitors : '—'}
            </span>
        </div>
    );
}

export default VisitorCount;
