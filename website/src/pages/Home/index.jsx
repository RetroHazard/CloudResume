import PersonalSummary from '../../components/personal_summary';
import SocialLinks from '../../components/social_links';
import { HeroName } from '../../components/hero';
import { SectionShell, Chip } from '../../components/ui/primitives';
import { useJsonData, LoadingSkeleton } from '../../utils/useJsonData';

function Home() {
    const { data: personalData, loading, error } = useJsonData('personal_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !personalData) return null;
    return (
        <>
            <title>Cloud Resume</title>
            <SectionShell id='profile' kicker='// whoami'>
                <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
                    <div className='flex flex-col items-center gap-4'>
                        <div className='relative'>
                            <div className='absolute -inset-1 rounded-2xl bg-gradient-to-tr from-neon/40 to-glow/30 opacity-60 blur-md' />
                            <img
                                className='relative max-w-none rounded-2xl ring-1 ring-border max-sm:size-40 sm:size-40 md:size-52'
                                src={personalData.profilePicture}
                                alt={`Photo of ${personalData.fullName}`}
                            />
                        </div>
                        <SocialLinks />
                    </div>

                    <div className='flex w-full flex-col gap-5'>
                        <div>
                            <HeroName
                                text={personalData.fullName}
                                className='mb-1 font-heading text-2xl font-extrabold text-content-header sm:text-3xl md:text-4xl'
                            />
                            <p className='mb-0 font-mono text-sm text-neon sm:text-base'>
                                <span className='text-glow'>&gt;</span> {personalData.jobTitle}
                            </p>
                        </div>

                        <p className='mb-0 font-mono text-xs text-content-accent'>
                            <span className='text-content-subtitle'>location:</span> {personalData.location}
                        </p>

                        {personalData.availability?.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {personalData.availability.map((tag) => (
                                    <Chip key={tag}>{tag}</Chip>
                                ))}
                            </div>
                        )}

                        <a
                            href={personalData.resumeLink}
                            download
                            className='inline-flex w-fit items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-4 py-2 font-mono text-sm font-semibold text-neon no-underline transition-colors hover:bg-neon/20'
                        >
                            <iconify-icon icon='fa6-solid:cloud-arrow-down' aria-hidden='true' />
                            Download CV
                        </a>
                    </div>
                </div>

                <div className='mt-6 flex flex-col gap-4 border-t border-border pt-6'>
                    <PersonalSummary />
                </div>
            </SectionShell>
        </>
    );
}

export default Home;
