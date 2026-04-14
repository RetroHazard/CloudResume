import { useState, useEffect } from 'react';
import { jsonLoader } from './jsonLoader';

export function useJsonData(file) {
    const [state, setState] = useState({ data: null, error: null, loading: !!file });

    useEffect(() => {
        if (!file) return;
        let cancelled = false;
        jsonLoader(file)
            .then((data) => { if (!cancelled) setState({ data, error: null, loading: false }); })
            .catch((error) => { if (!cancelled) setState({ data: null, error, loading: false }); });
        return () => { cancelled = true; };
    }, [file]);

    return state;
}

import React from 'react';

export function LoadingSkeleton() {
    return (
        <div className='content-block animate-pulse' role='status' aria-label='Loading content'>
            <div className='h-6 w-1/3 rounded bg-secondary-600' />
            <div className='h-4 w-full rounded bg-secondary-600' />
            <div className='h-4 w-5/6 rounded bg-secondary-600' />
        </div>
    );
}
