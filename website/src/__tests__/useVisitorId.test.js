import { renderHook } from '@testing-library/react';
import { useVisitorId } from '../utils/useVisitorId';

// iOS Safari with "Block All Cookies" throws on any access to `localStorage`,
// not just on write. The hook renders inside the nav bar, so a throw here used
// to unmount the whole app — the site came up blank on that one browser.
function withLocalStorage(impl) {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, ...impl });
    return () => {
        if (original) Object.defineProperty(globalThis, 'localStorage', original);
        else delete globalThis.localStorage;
    };
}

describe('useVisitorId', () => {
    let restore;

    afterEach(() => {
        restore?.();
        restore = undefined;
    });

    it('reuses a previously stored id', () => {
        restore = withLocalStorage({
            value: { getItem: () => 'stored-id', setItem: vi.fn() },
        });
        const { result } = renderHook(() => useVisitorId());
        expect(result.current).toBe('stored-id');
    });

    it('generates and persists an id when none is stored', () => {
        const setItem = vi.fn();
        restore = withLocalStorage({ value: { getItem: () => null, setItem } });

        const { result } = renderHook(() => useVisitorId());

        expect(result.current).toBeTruthy();
        expect(setItem).toHaveBeenCalledWith('uuid', result.current);
    });

    it('still yields an id when storage access throws', () => {
        restore = withLocalStorage({
            get() {
                throw new DOMException('The operation is insecure.', 'SecurityError');
            },
        });

        const { result } = renderHook(() => useVisitorId());

        expect(typeof result.current).toBe('string');
        expect(result.current.length).toBeGreaterThan(0);
    });

    it('still yields an id when writing to storage throws', () => {
        restore = withLocalStorage({
            value: {
                getItem: () => null,
                setItem: () => {
                    throw new DOMException('exceeded the quota.', 'QuotaExceededError');
                },
            },
        });

        const { result } = renderHook(() => useVisitorId());

        expect(typeof result.current).toBe('string');
        expect(result.current.length).toBeGreaterThan(0);
    });

    it('falls back to a random id when crypto.randomUUID is unavailable', () => {
        restore = withLocalStorage({ value: { getItem: () => null, setItem: vi.fn() } });
        const randomUUID = globalThis.crypto?.randomUUID;
        if (randomUUID) globalThis.crypto.randomUUID = undefined;

        try {
            const { result } = renderHook(() => useVisitorId());
            expect(result.current).toMatch(/^anon-/);
        } finally {
            if (randomUUID) globalThis.crypto.randomUUID = randomUUID;
        }
    });
});
