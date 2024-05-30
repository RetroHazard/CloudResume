import React, { useState, useEffect } from 'react';

import { Icon } from '@iconify-icon/react';

function VisitorCount() {
    const [visitors, setVisitors] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchVisitorCount() {
            try {
                // Generate or retrieve a unique identifier for the visitor
                let visitorId = localStorage.getItem('visitorId');
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem('visitorId', visitorId);
                }

                // Send the visitorId as a query parameter
                let response = await fetch(`https://api.cloudresume-agb.jp/v1/visitors?visitorId=${visitorId}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                let data = await response.json();
                setVisitors(data['count']);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        }

        fetchVisitorCount();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className='mb-1 mt-1 inline-flex w-full items-center bg-secondary-700 px-4 py-1 max-sm:hidden'>
            <i className='icon-box'>
                <Icon icon='fa6-solid:users' />
            </i>
            <span className='font-sans text-base'>{visitors !== null ? visitors : 'Loading...'}</span>
        </div>
    );
}

export default VisitorCount;
