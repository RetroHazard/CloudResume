import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

const LanguageItem = () => {
    const { data, loading, error } = useJsonData('skill_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    const languageData = data.language_skills;
    return (
        <div className='flex flex-wrap gap-3'>
            {languageData.map((skill, index) => (
                <div className='skill-block' key={index}>
                    <Icon inline icon={skill.flag} width='1.25em' height='1.25em' />
                    {`${skill.language} - ${skill.level}`}
                </div>
            ))}
        </div>
    );
};

export default LanguageItem;
