import React from 'react';

function PersonalSummary() {
    if (process.env.REACT_APP_DATA_SET === 'development') {
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at{' '}
                    <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <a href='.'>vehicula</a>.
                    Nulla lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus
                    elit ut nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut
                    imperdiet vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo.
                    Pellentesque posuere justo vitae massa volutpat maximus.
                </p>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at{' '}
                    <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi{' '}
                    <a href='/public'>vehicula</a>. Nulla lacinia, erat sit amet elementum vulputate, lectus mauris
                    volutpat mi, vitae accumsan metus elit ut nunc. Vestibulum lacinia enim eget eros fermentum
                    scelerisque. Proin augue leo, posuere ut imperdiet vitae, fermentum eu ipsum. Sed sed neque
                    sagittis, posuere urna nec, commodo leo. Pellentesque posuere justo vitae massa volutpat maximus.
                </p>
            </>
        );
    } else if (process.env.REACT_APP_DATA_SET === 'production') {
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    With a vibrant career spanning over 15 years in the tech industry, I've worn many hats—from help
                    desk support and systems administration to systems architecture, project management, and consulting.
                    I've delved into network operations, service management, web development, graphics design, hardware
                    testing, game development, 3D graphics, and VFX. My journey has even taken me abroad, where I
                    managed a small team and thrived in a foreign environment. Now, I’m on the lookout for exciting
                    opportunities in consulting, project management, or engineering roles, especially those focused on
                    Cloud technologies and infrastructure. I have a particular soft spot for the entertainment, media,
                    and gaming industries, where creativity and technology intersect.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    What truly lights my fire is the thrill of learning and problem-solving. There's nothing quite like
                    the satisfaction of fitting the pieces of a complex puzzle together or finding a more efficient way
                    to tackle a challenge. I thrive on big problems that demand unique, out-of-the-box solutions.
                    Keeping my mind engaged with challenging projects is crucial—I tend to get bored easily if I'm not
                    constantly learning and pushing my limits.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    When I’m not immersed in tech, you’ll find me exploring my hobbies with equal passion. I love
                    capturing moments through photography and hitting the trails on my mountain bike. Music has been a
                    lifelong companion; I’ve played the piano for over a decade and the guitar for five years. Lately,
                    I’ve been itching to dive into woodworking and building projects. My passion for video games has led
                    me to learn C++, Unreal Engine, Blender, and other 3D/VFX software. I even developed and released a
                    component on the Unreal Marketplace and continue to experiment on this platform. My dream is to one
                    day release a complete commercial game. To keep my skills sharp and my curiosity satisfied, I run my
                    own homelab where I tinker with various projects and experiments.
                </p>
            </>
        );
    }
}

export default PersonalSummary;
