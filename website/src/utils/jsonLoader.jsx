export const jsonLoader = async (fileName) => {
    const envPath = import.meta.env.VITE_DATA_SET;
    const modules = import.meta.glob('../assets/json/**/*.json');
    const key = `../assets/json/${envPath}/${fileName}`;

    try {
        const module = await modules[key]();
        return module.default;
    } catch (error) {
        console.error('Error loading JSON file:', error);
        throw error;
    }
};