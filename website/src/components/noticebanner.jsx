import { Icon } from '@iconify-icon/react';

function NoticeBanner() {
    if (import.meta.env.VITE_DATA_SET !== 'development') return null;
    return (
        <div className='inline-flex w-full flex-row flex-nowrap justify-center'>
            <div className='flex h-20 w-fit justify-center rounded-b-xl bg-secondary-600'>
                <div className='icon-box mr-14 ml-5'>
                    <Icon icon='fa6-solid:screwdriver-wrench' height='2rem' aria-hidden='true' />
                </div>
                <div className='icon-box mt-2 mb-1 text-center'>
                    <p role='status' className='sm:text-base sm:font-light md:text-xl md:font-semibold lg:text-2xl'>
                        This page is under construction
                    </p>
                    <p className='sm:text-sm sm:font-light md:text-base md:font-semibold lg:text-lg'>
                        Some features may be unavailable
                    </p>
                </div>
                <div className='icon-box mr-5 ml-14'>
                    <Icon icon='fa6-solid:screwdriver-wrench' height='2rem' aria-hidden='true' />
                </div>
            </div>
        </div>
    );
}

export default NoticeBanner;
