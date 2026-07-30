import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { Reveal, LineBadge, StatusPill, lineColor } from './ui/primitives';
import { formatDate, isExpired, isUnknown } from '../utils/dates';
import { useToday } from '../utils/siteClock';

const CertificationList = () => {
    const { data, loading, error } = useJsonData('certification_data.json');
    // A pass expiring tonight has to start reading Expired at midnight, not on
    // the next reload. `useToday` only changes when the calendar day does, so
    // this costs one re-render a day rather than one a second.
    const today = useToday();
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {data.Certifications.map((item, index) => {
                const expired = isExpired(item.expiry_date, today);
                return (
                    <Reveal
                        // Three AWS certs carry `credential_id: "N/A"`, so keying on
                        // the id collided and React warned about duplicate keys.
                        key={`${item.certification}-${item.issued_date}`}
                        delay={index * 0.05}
                        className='group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-neon/40'
                    >
                        {/* pass stripe */}
                        <div className='h-1 w-full' style={{ background: lineColor(index) }} />
                        <div className='flex flex-1 flex-col gap-3 p-4'>
                            <div className='flex items-start gap-3'>
                                <img className='size-12 shrink-0 rounded ring-1 ring-border' src={item.logo} alt='' />
                                <div className='flex min-w-0 flex-col gap-0.5'>
                                    <h2 className='card-title'>{item.certification}</h2>
                                    <p className='card-subtitle'>{item.issuer}</p>
                                    {/* A "Fare Gate · Valid Passes" board that lists lapsed
                                        passes as valid is misleading — say so on the card. */}
                                    <StatusPill tone={expired ? 'alert' : 'on'}>
                                        {expired ? 'Expired' : 'Valid'}
                                    </StatusPill>
                                </div>
                                <span className='ml-auto'>
                                    <LineBadge letter={item.certification.charAt(0)} index={index} size='sm' />
                                </span>
                            </div>

                            {/* Validity ticket strip. `mt-auto` pins it to the bottom of the
                                card body — same trick as the link row below — so the strip and
                                the links line up across cards whose titles wrap differently. */}
                            <dl className='mt-auto grid grid-cols-3 gap-2 rounded border border-dashed border-border bg-background/50 px-3 py-2 font-mono text-[0.62rem]'>
                                <div className='flex flex-col'>
                                    <dt className='tracking-wider text-content-date uppercase'>ID:</dt>
                                    <dd className='tabular truncate text-content-subtitle'>
                                        {isUnknown(item.credential_id) ? '—' : item.credential_id}
                                    </dd>
                                </div>
                                <div className='flex flex-col'>
                                    <dt className='tracking-wider text-content-date uppercase'>Issued:</dt>
                                    <dd className='tabular text-neon'>{formatDate(item.issued_date)}</dd>
                                </div>
                                <div className='flex flex-col'>
                                    <dt className='tracking-wider text-content-date uppercase'>Expiry:</dt>
                                    <dd className={`tabular ${expired ? 'text-alert' : 'text-content-subtitle'}`}>
                                        {formatDate(item.expiry_date)}
                                    </dd>
                                </div>
                            </dl>

                            <div className='flex flex-wrap gap-2'>
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
                                                    <Icon
                                                        icon={link[0].icon}
                                                        height='1.1em'
                                                        width='1.1em'
                                                        aria-hidden='true'
                                                    />
                                                </a>
                                            ),
                                    ),
                                )}
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>
    );
};

export default CertificationList;
