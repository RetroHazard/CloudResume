// website/src/utils/useVisitorId.js
import { useState } from 'react';

export function useVisitorId() {
    const [id] = useState(() => {
        let v = localStorage.getItem('uuid');
        if (!v) {
            v = crypto.randomUUID();
            localStorage.setItem('uuid', v);
        }
        return v;
    });
    return id;
}
