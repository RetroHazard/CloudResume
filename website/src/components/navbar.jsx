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
                <i className='icon-box mr-2.5 h-5 w-5 text-base max-sm:m-0' aria-hidden='true'>
                    <Icon icon={icon} />
                </i>
                <span className='font-mono text-xs uppercase tracking-wider max-sm:sr-only'>
                    {label}
                </span>
            </NavLink>
        </li>
    );
}

function Navigation() {
    return (
        <nav
            aria-label='Primary navigation'
            className='sticky top-28 mt-28 mr-5 flex h-fit self-start rounded-xl border border-border bg-card/70 p-2 shadow-lg shadow-black/40 ring-1 ring-neon/10 backdrop-blur-md'
            id='navbar'
        >
            <ul className='flex flex-col space-y-1 text-sm font-medium text-content-accent'>
                <li
                    aria-hidden='true'
                    className='px-3 pb-2 pt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-neon/70 max-sm:hidden'
                >
                    ~/navigate
                </li>
                {NAV_ITEMS.map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
                <li aria-hidden='true' className='my-2 h-px w-full bg-border max-sm:hidden' />
                <li>
                    <VisitorCount />
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
