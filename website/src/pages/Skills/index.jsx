import { lazy, Suspense } from 'react';
import SkillHighlight from '../../components/skill_highlight';
import SkillButton from '../../components/skill_button';
import LanguageItem from '../../components/language_item';
import { SectionShell, Reveal } from '../../components/ui/primitives';

// Heavy (visx + charts) and only used here — split into its own chunk.
const SkillsCharts = lazy(() => import('../../components/skills_charts'));

function SubHeading({ children }) {
    return (
        <h2 className='mb-0 font-mono text-xs uppercase tracking-[0.2em] text-neon/80'>
            {children}
        </h2>
    );
}

function Skills() {
    return (
        <>
            <title>Skills | Cloud Resume</title>
            <SectionShell id='skills' kicker='// capabilities' title='Skills'>
                <div className='flex flex-col gap-10'>
                    <Reveal className='rounded-xl border border-border bg-background/40 p-4 sm:p-6'>
                        <Suspense fallback={<div className='h-72 animate-pulse rounded-lg bg-secondary-700/40' />}>
                            <SkillsCharts />
                        </Suspense>
                    </Reveal>

                    <Reveal className='flex flex-col gap-4'>
                        <SubHeading>Toolbox</SubHeading>
                        <SkillHighlight />
                    </Reveal>

                    <Reveal className='flex flex-col gap-3'>
                        <SubHeading>Exploring</SubHeading>
                        <SkillButton />
                    </Reveal>

                    <Reveal className='flex flex-col gap-3'>
                        <SubHeading>Languages</SubHeading>
                        <LanguageItem />
                    </Reveal>
                </div>
            </SectionShell>
        </>
    );
}

export default Skills;
