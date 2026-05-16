import { Helmet } from 'react-helmet-async';
import EducationList from '../../components/education_list';

function Education() {
    return (
        <>
            <Helmet><title>Education | Cloud Resume</title></Helmet>
            <div className='content-block' id='education'>
                <h1 className='h1 mb-0 font-heading font-bold text-content-header text-2xl sm:text-3xl'>Education</h1>
                <div className='flex flex-col gap-8'>
                    <EducationList />
                </div>
            </div>
        </>
    );
}

export default Education;
