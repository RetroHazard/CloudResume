import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { Reveal, LineBadge, lineColor } from './ui/primitives';

const CertificationList = () => {
    const { data, loading, error } = useJsonData('certification_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {data.Certifications.map((item, index) => (
                <Reveal
                    key={item.credential_id || item.certification}
                    delay={index * 0.05}
                    className='group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-neon/40'
                >
                    {/* pass stripe */}
                    <div className='h-1 w-full' style={{ background: lineColor(index) }} />
                    <div className='flex flex-1 flex-col gap-3 p-4'>
                        <div className='flex items-start gap-3'>
                            <img
                                className='size-12 shrink-0 rounded ring-1 ring-border'
                                src={item.logo}
                                alt=''
                            />
                            <div className='flex min-w-0 flex-col'>
                                <h3 className='card-title'>{item.certification}</h3>
                                <p className='card-subtitle'>{item.issuer}</p>
                            </div>
                            <span className='ml-auto'>
                                <LineBadge letter={item.certification.charAt(0)} index={index} size='sm' />
                            </span>
                        </div>

                        {/* validity ticket strip */}
                        <dl className='grid grid-cols-3 gap-2 rounded border border-dashed border-border bg-background/50 px-3 py-2 font-mono text-[0.62rem]'>
                            <div className='flex flex-col'>
                                <dt className='uppercase tracking-wider text-content-date'>ID:</dt>
                                <dd className='tabular truncate text-content-subtitle'>{item.credential_id}</dd>
                            </div>
                            <div className='flex flex-col'>
                                <dt className='uppercase tracking-wider text-content-date'>Issued:</dt>
                                <dd className='tabular text-neon'>{item.issued_date}</dd>
                            </div>
                            <div className='flex flex-col'>
                                <dt className='uppercase tracking-wider text-content-date'>Expiry:</dt>
                                <dd className='tabular text-content-subtitle'>{item.expiry_date}</dd>
                            </div>
                        </dl>

                        <div className='mt-auto flex flex-wrap gap-2'>
                            {item.links.map((linkGroup, linkIndex) =>
                                Object.entries(linkGroup).map(
                                    ([key, link]) =>
                                        link[0].display &&
                                        link[0].website && (
                                            <a
                                                key={`${key}-${linkIndex}`}
                                                href={link[0].website}
                                                className='social-link'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                aria-label={`${item.certification} – ${key} (opens in new tab)`}
                                            >
                                                <Icon icon={link[0].icon} height='1.1em' width='1.1em' aria-hidden='true' />
                                            </a>
                                        ),
                                ),
                            )}
                        </div>
                    </div>
                </Reveal>
            ))}
        </div>
    );
};

export default CertificationList;
