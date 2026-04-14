import { Helmet } from 'react-helmet-async';
import SkillHighlight from '../../components/skill_highlight';
import SkillButton from '../../components/skill_button';
import LanguageItem from '../../components/language_item';

function Skills() {
    return (
        <>
            <Helmet><title>Skills | Cloud Resume</title></Helmet>
            <div className='content-block' id='skills'>
                <h1 className='h1 mb-0 font-heading font-bold text-content-header text-2xl sm:text-3xl'>Skills</h1>
                <div className='flex flex-col gap-8'>
                    <div className='flex flex-col gap-3'>
                        <SkillHighlight />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <h3 className='mb-0 font-extrabold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                            Exploring
                        </h3>
                        <SkillButton />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <h3 className='mb-0 font-extrabold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                            Languages
                        </h3>
                        <LanguageItem />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Skills;
