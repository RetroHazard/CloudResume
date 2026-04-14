import { useJsonData, LoadingSkeleton } from './useJsonData';

const DataLoader = ({ file, children }) => {
    const { data, loading, error } = useJsonData(file);
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return children(data);
};

export default DataLoader;
