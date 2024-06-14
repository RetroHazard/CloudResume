import React, { useState, useEffect } from 'react';
import {jsonLoader} from "./jsonLoader";

const DataLoader = ({ file, children }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const loadedData = await jsonLoader(file);
                setData(loadedData);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        fetchData();
    }, [file]);

    if (!data) {
        return <div>Loading...</div>;
    }

    return children(data);
};

export default DataLoader;