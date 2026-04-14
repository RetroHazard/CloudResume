const modules = import.meta.glob('../assets/json/**/*.json');
const cache = new Map();

export const jsonLoader = (fileName) => {
    if (cache.has(fileName)) return cache.get(fileName);
    const envPath = import.meta.env.VITE_DATA_SET;
    const key = `../assets/json/${envPath}/${fileName}`;
    const p = modules[key]().then((m) => m.default);
    cache.set(fileName, p);
    return p;
};
