// website/src/utils/apiClient.js
const BASE = import.meta.env.VITE_AWS_API_ENDPOINT;

export const apiGet = (path, params, signal) =>
    fetch(`${BASE}${path}?${new URLSearchParams(params)}`, { signal })
        .then((r) => {
            if (!r.ok) throw new Error(r.statusText);
            return r.json();
        });

export const apiPost = (path, body) =>
    fetch(`${BASE}${path}`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
    });
