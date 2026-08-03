// website/src/utils/useVisitorId.js
import { useState } from 'react';

const STORAGE_KEY = 'uuid';

// Web Storage is not always reachable. iOS Safari with "Block All Cookies" set
// throws a SecurityError on the very first property access — not on read, on
// touching `localStorage` at all — and older WebKit throws QuotaExceededError
// when writing in a private tab. This hook runs inside the nav bar, which sits
// outside the ErrorBoundary, so an unguarded throw here took the whole app down
// to a blank page for anyone with that setting on.
//
// A visitor with storage blocked simply counts as new on every visit, which is
// the correct outcome for someone who has asked not to be persisted anyway.
function readStoredId() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeId(value) {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        /* storage unavailable — the id stays good for this page view only */
    }
}

// `crypto.randomUUID` needs a secure context and Safari 15.4+; fall back to a
// plain random id rather than throwing, since this value only has to be unique
// enough to deduplicate a visit.
function newId() {
    try {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch {
        /* fall through */
    }
    return `anon-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function useVisitorId() {
    const [id] = useState(() => {
        const stored = readStoredId();
        if (stored) return stored;
        const created = newId();
        storeId(created);
        return created;
    });
    return id;
}
