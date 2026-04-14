import { Helmet } from 'react-helmet-async';
import ExperienceList from '../../components/experience_list';

function Experience() {
    return (
        <>
            <Helmet><title>Experience | Cloud Resume</title></Helmet>
            <div className='content-block' id='experience'>
                <h1 className='h1 mb-0 font-heading font-bold text-content-header text-2xl sm:text-3xl'>Experience</h1>
                <div className='flex flex-col gap-8'>
                    <ExperienceList />
                </div>
            </div>
        </>
    );
}

export default Experience;
