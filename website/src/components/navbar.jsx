import React from 'react';
import { NavLink } from 'react-router-dom';

import { Icon } from '@iconify-icon/react';

import VisitorCount from './visitor_count';

function Navigation() {
    return (
        <>
            <nav className='float-left mr-5 mt-28 flex h-fit rounded-lg bg-secondary-700 p-2' id='navbar'>
                <ul className='flex-col text-sm font-medium text-content-accent'>
                    <li>
                        <NavLink
                            to={'/'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:house' />
                            </i>
                            <div className='max-sm:hidden'>Home</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/education'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:graduation-cap' />
                            </i>
                            <div className='max-sm:hidden'>Education</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/experience'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:briefcase' />
                            </i>
                            <div className='max-sm:hidden'>Experience</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/certifications'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:certificate' />
                            </i>
                            <div className='max-sm:hidden'>Certifications</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/projects'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:layer-group' />
                            </i>
                            <div className='max-sm:hidden'>Projects</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/skills'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:chart-simple' />
                            </i>
                            <div className='max-sm:hidden'>Skills</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/contact'}
                            className={({ isActive }) => {
                                return isActive ? 'nav-block-active' : 'nav-block-inactive';
                            }}
                        >
                            <i className='icon-box'>
                                <Icon icon='fa6-solid:message' />
                            </i>
                            <div className='max-sm:hidden'>Contact</div>
                        </NavLink>
                    </li>
                    <div className='mb-2 mt-2 h-0.5 w-full justify-between bg-secondary-600 max-sm:hidden'></div>
                    <li className='flex-col text-sm font-medium text-content-accent'>
                        <VisitorCount />
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navigation;
