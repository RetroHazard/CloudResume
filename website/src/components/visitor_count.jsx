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
            className='mb-1 mt-1 inline-flex w-full items-center px-4 py-1 max-sm:hidden'
            role='status'
            aria-live='polite'
            aria-atomic='true'
        >
            <i className='icon-box mr-2.5 h-5 w-5 text-base' aria-hidden='true'>
                <Icon icon='fa6-solid:users' />
            </i>
            <span className='font-sans text-base'>
                <span className='sr-only'>Site visitors: </span>
                {visitors !== null ? visitors : '—'}
            </span>
        </div>
    );
}

export default VisitorCount;
