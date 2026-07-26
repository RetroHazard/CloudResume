import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import VisitorCount from './visitor_count';
import { lineColor } from './ui/primitives';

// The primary navigation is a metro "line map": each route is a station stop on
// a single vertical rail, colour-coded and labelled. The active stop lights up.
const NAV_ITEMS = [
    { to: '/', icon: 'fa6-solid:house', label: 'Home' },
    { to: '/education', icon: 'fa6-solid:graduation-cap', label: 'Education' },
    { to: '/experience', icon: 'fa6-solid:briefcase', label: 'Experience' },
    { to: '/certifications', icon: 'fa6-solid:certificate', label: 'Certifications' },
    { to: '/projects', icon: 'fa6-solid:layer-group', label: 'Projects' },
    { to: '/skills', icon: 'fa6-solid:chart-simple', label: 'Skills' },
    { to: '/contact', icon: 'fa6-solid:message', label: 'Contact' },
];

function Station({ to, icon, label, index }) {
    const color = lineColor(index);
    return (
        <li>
            <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'nav-block-active' : 'nav-block-inactive')}
            >
                {({ isActive }) => (
                    <>
                        {/* station node on the rail */}
                        <span
                            aria-hidden="true"
                            className="relative z-10 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 bg-background transition-all"
                            style={{
                                borderColor: color,
                                boxShadow: isActive ? `0 0 0 4px ${color}22` : 'none',
                            }}
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full transition-all"
                                style={{ background: isActive ? color : 'transparent' }}
                            />
                        </span>
                        <i className="icon-box h-4 w-4 text-sm max-sm:hidden" aria-hidden="true">
                            <Icon icon={icon} />
                        </i>
                        <span>{label}</span>
                    </>
                )}
            </NavLink>
        </li>
    );
}

function Navigation() {
    return (
        <nav
            aria-label="Primary navigation"
            className="flex rounded-xl border border-border bg-card/80 shadow-lg shadow-black/40 backdrop-blur-md max-sm:w-full max-sm:p-2 sm:sticky sm:top-24 sm:mt-24 sm:mr-5 sm:h-fit sm:self-start sm:p-3"
            id="navbar"
        >
            <ul className="relative flex gap-0.5 text-sm max-sm:w-full max-sm:flex-row max-sm:flex-wrap max-sm:justify-center max-sm:gap-1 sm:flex-col">
                {/* the rail line running behind the station nodes. The line map only
                    reads as a line when the stops are stacked, so it is desktop-only —
                    below `sm` the stops wrap into rows and the rail would cut through
                    them. */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-8 left-[1.45rem] top-9 w-0.5 bg-gradient-to-b from-line-green via-line-blue to-line-red opacity-40 max-sm:hidden"
                />
                <li
                    aria-hidden="true"
                    className="mb-1 flex items-center gap-2 px-2 pb-1 max-sm:hidden"
                >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-neon font-heading text-xs font-extrabold text-background">
                        AB
                    </span>
                    <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-content-accent">
                        Cloud Line
                    </span>
                </li>
                {NAV_ITEMS.map((item, index) => (
                    <Station key={item.to} index={index} {...item} />
                ))}
                <li aria-hidden="true" className="my-2 h-px w-full bg-border max-sm:hidden" />
                <li className="max-sm:hidden">
                    <VisitorCount />
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
