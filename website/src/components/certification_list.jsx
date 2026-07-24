import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { Reveal } from './ui/primitives';

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
                    className='group flex gap-4 rounded-xl border border-border bg-secondary-800/40 p-4 transition-all hover:-translate-y-0.5 hover:border-neon/40 hover:shadow-lg hover:shadow-neon/5'
                >
                    <img
                        className='size-14 shrink-0 rounded-xl ring-1 ring-border sm:size-16'
                        src={item.logo}
                        alt=''
                    />
                    <div className='flex min-w-0 flex-1 flex-col'>
                        <h3 className='card-title'>{item.certification}</h3>
                        <p className='card-subtitle'>{item.issuer}</p>
                        <p className='card-meta font-mono'>
                            <strong className='font-semibold text-content-accent'>ID:</strong> {item.credential_id}
                        </p>
                        <p className='card-meta font-mono'>
                            <strong className='font-semibold text-content-accent'>Issued:</strong> {item.issued_date}
                        </p>
                        <p className='card-meta font-mono'>
                            <strong className='font-semibold text-content-accent'>Expiry:</strong> {item.expiry_date}
                        </p>
                        <div className='mt-2 flex flex-wrap gap-2'>
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
                                                <Icon icon={link[0].icon} height='1.25em' width='1.25em' aria-hidden='true' />
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
