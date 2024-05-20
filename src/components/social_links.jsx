import React from 'react';
import { Icon } from '@iconify-icon/react';

import socialData from '../assets/json/socials_data.json';

const SocialLinks = () => {
    const displayedSocials = socialData.Socials.filter(social => social.display);

    return (
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {displayedSocials.map((social, index) => (
                <a key={index} className="social-link" href={social.link} aria-label={social.name}>
                    <i className="text-base text-content-icons">
                        <Icon className="social-link" icon={social.logo} height="1.25em" width="1.25em"/>
                    </i>
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;