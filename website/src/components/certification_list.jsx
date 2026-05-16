import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

const CertificationList = () => {
    const { data, loading, error } = useJsonData('certification_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div>
            {data.Certifications.map((item, index) => (
                <div className='flex flex-col gap-3' key={item.credential_id || item.certification}>
                    <div className='flex w-full justify-between gap-2'>
                        <div className='flex gap-4'>
                            <img
                                className='size-12 rounded-xl sm:h-[5.7rem] sm:w-[5.7rem]'
                                src={item.logo}
                                alt=''
                            />
                            <div className='flex flex-col'>
                                <h3 className='card-title'>{item.certification}</h3>
                                <p className='card-subtitle'>{item.issuer}</p>
                                <p className='card-meta'><strong>Credential ID:</strong> {item.credential_id}</p>
                                <p className='card-meta'><strong>Issued:</strong> {item.issued_date}</p>
                                <p className='card-meta'><strong>Expiry:</strong> {item.expiry_date}</p>
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'>
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
                    {index < data.Certifications.length - 1 && (
                        <div className='my-6 h-px w-full bg-secondary-600' />
                    )}
                </div>
            ))}
        </div>
    );
};

export default CertificationList;
