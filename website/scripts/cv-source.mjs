// Publishes the résumé data the site is built from as data/cv-source.json, so the
// downloadable CV can be compiled from exactly what the site shows.
//
// The downloadResume Lambda reads this object on every Download CV click, with a
// conditional GET, and only renders a new PDF when the content it projects out of
// it has changed (see infrastructure/codebase/renderResume.py). Emitting it from
// the build, rather than committing a copy, is what keeps the two from drifting:
// the same JSON that goes into the bundle goes into this file, in the same deploy.
//
// The keys are the contract with renderResume.build_model. Rename one here and
// that section silently drops out of the CV.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const CV_SOURCE_PATH = 'data/cv-source.json';

export const CV_SOURCE_FILES = {
    personal: 'personal_data.json',
    career: 'career_data.json',
    certifications: 'certification_data.json',
    education: 'education_data.json',
    projects: 'project_data.json',
    skills: 'skill_data.json',
    socials: 'socials_data.json',
};

const DATA_ROOT = fileURLToPath(new URL('../src/assets/json/', import.meta.url));

export function buildCvSource(dataSet, root = DATA_ROOT) {
    return Object.fromEntries(
        Object.entries(CV_SOURCE_FILES).map(([key, file]) => [
            key,
            JSON.parse(readFileSync(join(root, dataSet, file), 'utf8')),
        ]),
    );
}

export function cvSourcePlugin(dataSet = process.env.VITE_DATA_SET) {
    return {
        name: 'cv-source',
        apply: 'build',
        generateBundle() {
            if (!dataSet) {
                this.error('VITE_DATA_SET is not set, so there is no data set to publish as the CV source.');
            }
            this.emitFile({
                type: 'asset',
                fileName: CV_SOURCE_PATH,
                source: JSON.stringify(buildCvSource(dataSet)),
            });
        },
    };
}
