import React from 'react';

import { Icon } from '@iconify-icon/react';
import DataLoader from '../utils/dataLoader';
const jsonTarget = 'socials_data.json';

const SocialLinks = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const displayedSocials = data.Socials.filter((social) => social.display);
                return (
                    <div className='flex flex-wrap gap-3 max-sm:flex-row sm:flex-col md:flex-col lg:flex-nowrap'>
                        {displayedSocials.map((social, index) => (
                            <a key={index} className='social-link' href={social.link} aria-label={social.name}>
                                <i className='text-base text-content-icons'>
                                    <Icon className='social-link' icon={social.logo} height='1.25em' width='1.25em' />
                                </i>
                            </a>
                        ))}
                    </div>
                );
            }}
        </DataLoader>
    );
};

export default SocialLinks;
