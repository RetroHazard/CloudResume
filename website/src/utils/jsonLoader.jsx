export const jsonLoader = async (fileName) => {
    const envPath = process.env.REACT_APP_DATA_SET;
    const context = require.context('../assets/json/', true, /\.json$/);

    try {
        const dataModule = context(`./${envPath}/${fileName}`);
        return dataModule;
    } catch (error) {
        console.error('Error loading JSON file:', error);
        throw error;
    }
};