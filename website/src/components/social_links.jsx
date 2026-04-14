import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

const SocialLinks = () => {
    const { data, loading, error } = useJsonData('socials_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    const displayedSocials = data.Socials.filter((social) => social.display);
    return (
        <div className='flex gap-3'>
            {displayedSocials.map((social, index) => (
                <a key={index} className='social-link' href={social.link} aria-label={social.name}>
                    <i className='text-base text-content-icons'>
                        <Icon className='social-link' icon={social.logo} height='1.25em' width='1.25em' />
                    </i>
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
