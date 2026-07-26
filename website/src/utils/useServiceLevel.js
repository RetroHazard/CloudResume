import { useEffect, useState } from 'react';
import { getServiceLevel } from './serviceStatus';

// The service level only moves on the hour, so anything that just needs to know
// which band we are in (the background map, not the header's ticking clock) can
// poll lazily. `SERVICE_LEVELS` entries are stable singletons, so re-setting the
// same band is a no-op re-render as far as React is concerned.
export default function useServiceLevel(pollMs = 30000) {
    const [level, setLevel] = useState(() => getServiceLevel());

    useEffect(() => {
        const id = setInterval(() => setLevel(getServiceLevel()), pollMs);
        return () => clearInterval(id);
    }, [pollMs]);

    return level;
}
