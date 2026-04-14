import { Helmet } from 'react-helmet-async';
import PersonalSummary from '../../components/personal_summary';
import SocialLinks from '../../components/social_links';
import { useJsonData, LoadingSkeleton } from '../../utils/useJsonData';

function Home() {
    const { data: personalData, loading, error } = useJsonData('personal_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !personalData) return null;
    return (
        <>
            <Helmet>
                <title>Cloud Resume</title>
            </Helmet>
            <div className='content-block' id='profile'>
                <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
                    <div className='flex flex-col items-center gap-4'>
                        <img
                            className='max-w-none rounded-xl max-sm:size-40 sm:size-40 md:size-56'
                            src={personalData.profilePicture}
                            alt={`Photo of ${personalData.fullName}`}
                        />
                        <div className='flex flex-col'>
                            <SocialLinks />
                        </div>
                    </div>
                    <div className='flex w-full flex-col gap-5'>
                        <div className='flex w-full flex-col justify-between gap-2 sm:flex-row'>
                            <div className='w-full'>
                                <h1 className='h1 mb-0 font-extrabold text-content-header text-xl sm:text-2xl md:text-3xl'>
                                    {personalData.fullName}
                                </h1>
                                <h2 className='mb-0 text-base font-medium text-content-header max-sm:text-sm sm:text-sm md:text-base'>
                                    {personalData.jobTitle}
                                </h2>
                            </div>
                        </div>
                        <div className='flex flex-col gap-6'>
                            <div>
                                <span className='font-medium text-content-subtitle max-sm:text-xs sm:text-sm md:text-base'>
                                    Location:{' '}
                                </span>
                                <span className='text-content-accent max-sm:text-xs sm:text-sm md:text-base'>
                                    {personalData.location}
                                </span>
                            </div>
                            <a
                                href={personalData.resumeLink}
                                download
                                className='inline-flex w-fit items-center rounded bg-primary-500 px-4 py-2 font-bold text-secondary-800 no-underline hover:bg-primary-400'
                            >
                                <iconify-icon
                                    icon='fa6-solid:cloud-arrow-down'
                                    aria-hidden='true'
                                    class='mr-2 text-content-header'
                                />
                                <span className='text-sm text-content-header max-sm:text-xs max-sm:font-light'>
                                    Download CV
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <PersonalSummary />
                    {personalData.availability && personalData.availability.length > 0 && (
                        <div className='flex flex-wrap gap-3'>
                            {personalData.availability.map((tag) => (
                                <div key={tag} className='open-for-block'>{tag}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Home;
