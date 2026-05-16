const modules = import.meta.glob('../assets/json/**/*.json');
const cache = new Map();

export const jsonLoader = (fileName) => {
    const envPath = import.meta.env.VITE_DATA_SET;
    const key = `../assets/json/${envPath}/${fileName}`;
    if (cache.has(key)) return cache.get(key);
    const p = modules[key]().then((m) => m.default);
    cache.set(key, p);
    return p;
};
