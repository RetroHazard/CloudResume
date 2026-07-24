import '@testing-library/jest-dom';

// jsdom lacks these; motion.dev (whileInView) and reduced-motion checks need them.
if (!('IntersectionObserver' in globalThis)) {
    class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    }
    globalThis.IntersectionObserver = IntersectionObserver;
    globalThis.IntersectionObserverEntry = function () {};
}

if (!globalThis.matchMedia) {
    globalThis.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
            return false;
        },
    });
}
