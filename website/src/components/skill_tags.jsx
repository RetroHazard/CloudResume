import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

// Renders a simple, non-linked pill list from a skill_data.json array
// (e.g. `industry_knowledge` or `soft_skills`) whose items are `{ name }`.
const SkillTags = ({ dataKey, items: propItems }) => {
    const { data, loading, error } = useJsonData(propItems ? null : 'skill_data.json');
    const items = propItems ?? data?.[dataKey];
    if (loading) return <LoadingSkeleton />;
    if (error || !items || items.length === 0) return null;
    return (
        <div className='flex flex-wrap max-sm:gap-1 sm:gap-2 md:gap-3'>
            {items.map((item, index) => (
                <span className='skill-block' key={index}>
                    {item.name}
                </span>
            ))}
        </div>
    );
};

export default SkillTags;
