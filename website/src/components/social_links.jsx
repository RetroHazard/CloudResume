import { Icon } from '@iconify-icon/react';
import { useJsonData } from '../utils/useJsonData';

const SocialLinks = () => {
    const { data, loading, error } = useJsonData('socials_data.json');
    if (loading || error || !data) return null;
    const displayedSocials = data.Socials.filter((social) => social.display);
    return (
        <div className='flex gap-3'>
            {displayedSocials.map((social) => (
                <a
                    key={social.name}
                    className='social-link'
                    href={social.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`${social.name} (opens in new tab)`}
                >
                    <i className='flex items-center text-base text-content-icons' aria-hidden='true'>
                        <Icon icon={social.logo} height='1.25em' width='1.25em' />
                    </i>
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
