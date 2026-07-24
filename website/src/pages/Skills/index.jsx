import { lazy, Suspense } from 'react';
import SkillHighlight from '../../components/skill_highlight';
import SkillButton from '../../components/skill_button';
import LanguageItem from '../../components/language_item';
import { SectionShell, Reveal } from '../../components/ui/primitives';

// Heavy (visx + charts) and only used here — split into its own chunk.
const SkillsCharts = lazy(() => import('../../components/skills_charts'));

function SubHeading({ children }) {
    return (
        <h2 className='mb-0 flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-glow'>
            <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-glow' />
            {children}
        </h2>
    );
}

function Skills() {
    return (
        <>
            <title>Skills | Cloud Resume</title>
            <SectionShell id='skills' kicker='Network Map · Capabilities' title='Skills' line={4}>
                <div className='flex flex-col gap-10'>
                    <Reveal className='rounded-lg border border-border bg-background/40 p-4 sm:p-6'>
                        <Suspense fallback={<div className='h-72 animate-pulse rounded bg-secondary-700/40' />}>
                            <SkillsCharts />
                        </Suspense>
                    </Reveal>

                    <Reveal className='flex flex-col gap-4'>
                        <SubHeading>Rolling Stock — Toolbox</SubHeading>
                        <SkillHighlight />
                    </Reveal>

                    <Reveal className='flex flex-col gap-3'>
                        <SubHeading>Under Construction — Exploring</SubHeading>
                        <SkillButton />
                    </Reveal>

                    <Reveal className='flex flex-col gap-3'>
                        <SubHeading>Announcements — Languages</SubHeading>
                        <LanguageItem />
                    </Reveal>
                </div>
            </SectionShell>
        </>
    );
}

export default Skills;
