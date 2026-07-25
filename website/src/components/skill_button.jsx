import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { BrandIcon } from './ui/brand_icon';

const SkillButtonList = ({ skills }) => (
    <div className='flex flex-wrap max-sm:gap-1 sm:gap-2 md:gap-3'>
        {skills.map((skill, index) => (
            <a
                key={index}
                className='skill-block'
                href={skill.website}
                target='_blank'
                rel='noopener noreferrer'
            >
                <BrandIcon
                    className='icon-box'
                    icon={skill.logo}
                    name={skill.name}
                    monogram={skill.monogram}
                    size='1.1em'
                />
                {skill.name}
            </a>
        ))}
    </div>
);

const SkillButton = ({ skills: propSkills }) => {
    const { data, loading, error } = useJsonData(propSkills ? null : 'skill_data.json');
    const skills = propSkills ?? data?.target_skills;
    if (loading) return <LoadingSkeleton />;
    if (error || !skills) return null;
    return <SkillButtonList skills={skills} />;
};

export default SkillButton;
