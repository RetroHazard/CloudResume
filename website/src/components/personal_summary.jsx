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
                    With over <strong>15 years</strong> in the tech industry, I’ve gained a wealth of experience across
                    roles such as client support, systems administration, systems architecture, cybersecurity, project
                    management, and consulting. Now, I’m <em>seeking opportunities</em> in consulting, project
                    management, or engineering, particularly in developing client solutions, leveraging{' '}
                    <em>Cloud Technologies</em>.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    I’m driven by a passion for learning and solving <em>complex problems</em>. My broad industry
                    knowledge provides <em>unique insights</em> across <strong>multiple disciplines</strong>, enabling
                    me to design and build <em>secure</em>, <em>effective</em>, and <em>innovative</em> technology
                    solutions. I thrive when presented with challenges that require out-of-the-box thinking and enjoy
                    finding more <strong>efficient</strong> ways to achieve goals. Keeping mentally engaged and
                    continuously learning is crucial for me.
                </p>

                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Outside of work, I immerse myself in hobbies like photography, mountain biking, and music—I’ve
                    played piano for over a <em>decade</em> and guitar for <em>five years</em>. I also have a passion
                    for video games, which led me to learn <strong>C++</strong>, Unreal Engine, Blender, and other
                    3D/VFX software(s). I’ve <em>independently developed</em> a component on the Unreal Marketplace and
                    continue to experiment, with the ultimate goal of releasing a complete commercial game. To
                    continually practice and develop my skills, I run a homelab for various projects and experiments.
                </p>
            </>
        );
    }
}

export default PersonalSummary;
