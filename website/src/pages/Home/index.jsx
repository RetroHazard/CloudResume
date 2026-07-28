import PersonalSummary from '../../components/personal_summary';
import ServiceStatusPill from '../../components/service_status_pill';
import SocialLinks from '../../components/social_links';
import SplitFlap from '../../components/split_flap';
import { SectionShell, Chip } from '../../components/ui/primitives';
import { useJsonData, LoadingSkeleton } from '../../utils/useJsonData';

function Home() {
    const { data: personalData, loading, error } = useJsonData('personal_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !personalData) return null;
    return (
        <>
            <title>Cloud Resume</title>
            <SectionShell
                id='profile'
                kicker='Terminus · Line Origin'
                title='Concourse'
                // The concourse label is board chrome; the page's h1 is the name below.
                titleAs='p'
                line={0}
                // The board status follows the Tokyo timetable, same as the
                // header badge and the trains on the background map.
                right={<ServiceStatusPill />}
            >
                <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
                    {/* ID pass card */}
                    <div className='flex flex-col items-center gap-4'>
                        <div className='relative rounded-lg border border-border bg-secondary-800/60 p-2'>
                            <div className='absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-neon font-heading text-xs font-extrabold text-background shadow-lg'>
                                AB
                            </div>
                            <img
                                className='max-w-none rounded-md ring-1 ring-border max-sm:size-36 sm:size-40 md:size-48'
                                src={personalData.profilePicture}
                                alt={`Photo of ${personalData.fullName}`}
                            />
                            <p className='mt-2 text-center font-mono text-[0.58rem] uppercase tracking-[0.2em] text-content-accent'>
                                Commuter Pass · Valid
                            </p>
                        </div>
                        <SocialLinks />
                    </div>

                    {/* Board readout */}
                    <div className='flex w-full flex-col gap-5'>
                        <div className='flex flex-col gap-1'>
                            <span className='font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-glow'>
                                ● Now Arriving
                            </span>
                            <h1
                                aria-label={personalData.fullName}
                                className='mb-0 font-heading text-[2rem] font-extrabold uppercase leading-[0.95] tracking-wide text-content-header sm:text-4xl md:text-5xl'
                            >
                                <SplitFlap
                                    text={personalData.fullName}
                                    ariaLabel={personalData.fullName}
                                    cellClassName='inline-block'
                                />
                            </h1>
                        </div>

                        {/* Now boarding — role */}
                        <div className='flex flex-wrap items-center gap-2 rounded border border-border bg-background/60 px-3 py-2'>
                            <span className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-glow'>
                                Now Boarding →
                            </span>
                            <p className='mb-0 font-heading text-lg font-bold uppercase tracking-wide text-neon sm:text-xl'>
                                {personalData.jobTitle}
                            </p>
                        </div>

                        <p className='mb-0 font-mono text-xs text-content-accent'>
                            <span className='text-content-subtitle'>terminal:</span> {personalData.location}
                        </p>

                        {personalData.availability?.length > 0 && (
                            <div className='flex flex-col gap-1.5'>
                                <span className='font-mono text-[0.58rem] uppercase tracking-[0.18em] text-content-date'>
                                    Service Notices
                                </span>
                                <div className='flex flex-wrap gap-2'>
                                    {personalData.availability.map((tag) => (
                                        <Chip key={tag}>
                                            <span className='h-1.5 w-1.5 rounded-full bg-neon' />
                                            {tag}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        )}

                        <a
                            href={personalData.resumeLink}
                            download
                            className='ticket-button w-fit'
                        >
                            <iconify-icon icon='fa6-solid:ticket' aria-hidden='true' />
                            Download CV — Ticket
                        </a>
                    </div>
                </div>

                {/* Passenger notice / summary */}
                <div className='mt-6 flex flex-col gap-3 border-t border-border pt-6'>
                    <span className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-content-accent'>
                        ⓘ Passenger Information
                    </span>
                    <PersonalSummary />
                </div>
            </SectionShell>
        </>
    );
}

export default Home;
