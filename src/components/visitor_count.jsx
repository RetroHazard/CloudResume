import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Importing the v4 function from the uuid package

import { Icon } from '@iconify-icon/react';

function VisitorCount() {
    const [visitors, setVisitors] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchVisitorCount() {
            try {
                // Generate or retrieve a unique identifier for the visitor
                let visitorId = localStorage.getItem('uuid');
                if (!visitorId) {
                    visitorId = uuidv4(); // Use uuidv4 to generate a unique identifier
                    localStorage.setItem('uuid', visitorId);
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
        <div className='mb-1 mt-1 inline-flex w-full items-center px-4 py-1 max-sm:hidden'>
            <i className='icon-box'>
                <Icon inline='' icon='fa6-solid:users' />
            </i>
            <span className='font-sans text-base'>{visitors !== null ? visitors : 'Loading...'}</span>
        </div>
    );
}

export default VisitorCount;
