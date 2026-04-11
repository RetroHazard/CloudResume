import React from 'react';

function PersonalSummary() {
    if (process.env.REACT_APP_DATA_SET === 'development') {
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at{' '}
                    <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <em>vehicula</em>. Nulla
                    lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus elit ut
                    nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut imperdiet
                    vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo. Pellentesque
                    posuere justo vitae massa volutpat maximus.
                </p>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at{' '}
                    <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <em>vehicula</em>. Nulla
                    lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus elit ut
                    nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut imperdiet
                    vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo. Pellentesque
                    posuere justo vitae massa volutpat maximus.
                </p>
            </>
        );
    } else if (process.env.REACT_APP_DATA_SET === 'production') {
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Drawing on <strong>15 years of experience</strong> in the tech industry, I'm a versatile
                    professional specializing in both on-prem and cloud technologies, cybersecurity, and building
                    innovative client solutions. My expertise spans client support, systems administration,
                    architecture, identity and access management, project management, and consulting.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    I’m a self-starter, driven by a passion for learning and solving <em>complex problems</em>. My
                    diverse background allows me to approach challenges with a <em>unique perspective</em>, designing
                    secure and efficient technology solutions that drive business growth. I thrive when presented with
                    challenges that require out-of-the-box thinking and enjoy finding more <strong>efficient</strong>{' '}
                    ways to achieve goals. Keeping mentally engaged and continual learning is crucial for me.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    I constantly seek new <em>challenges and opportunities</em> to expand my skill set. My commitment to
                    learning extends beyond the workplace, where I have spent the past few years experimenting with
                    multiple disciplines in Game Development, from coding in <strong>C++</strong>, to 3D modeling and
                    simulation.
                </p>
            </>
        );
    }
}

export default PersonalSummary;
