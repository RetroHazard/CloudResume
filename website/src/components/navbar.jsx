import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import VisitorCount from './visitor_count';

const NAV_ITEMS = [
    { to: '/', icon: 'fa6-solid:house', label: 'Home' },
    { to: '/education', icon: 'fa6-solid:graduation-cap', label: 'Education' },
    { to: '/experience', icon: 'fa6-solid:briefcase', label: 'Experience' },
    { to: '/certifications', icon: 'fa6-solid:certificate', label: 'Certifications' },
    { to: '/projects', icon: 'fa6-solid:layer-group', label: 'Projects' },
    { to: '/skills', icon: 'fa6-solid:chart-simple', label: 'Skills' },
    { to: '/contact', icon: 'fa6-solid:message', label: 'Contact' },
];

function NavItem({ to, icon, label }) {
    return (
        <li>
            <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'nav-block-active' : 'nav-block-inactive')}
            >
                {({ isActive }) => (
                    <>
                        <i className='icon-box mr-2.5 h-5 w-5 text-base max-sm:m-0' aria-hidden='true'>
                            <Icon icon={icon} />
                        </i>
                        <span className='max-sm:sr-only'>
                            {label}
                        </span>
                    </>
                )}
            </NavLink>
        </li>
    );
}

function Navigation() {
    return (
        <nav
            aria-label='Primary navigation'
            className='sticky top-6 mr-5 flex h-fit self-start rounded-2xl bg-secondary-700 p-2'
            id='navbar'
        >
            <ul className='flex flex-col space-y-1 text-sm font-medium text-content-accent'>
                {NAV_ITEMS.map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
                <li aria-hidden='true' className='my-2 h-0.5 w-full bg-secondary-600 max-sm:hidden' />
            </ul>
            <VisitorCount />
        </nav>
    );
}

export default Navigation;
