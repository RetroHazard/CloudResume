// @vitest-environment node
import { buildCvSource, cvSourcePlugin, CV_SOURCE_FILES, CV_SOURCE_PATH } from '../../scripts/cv-source.mjs';

// data/cv-source.json is the only thing the downloadable CV is compiled from. If a data set
// loses a file, or the plugin stops emitting, the CV silently falls out of step with the site.
describe('CV source', () => {
    it.each(['production', 'development'])('bundles every section of the %s data set', (dataSet) => {
        const source = buildCvSource(dataSet);
        expect(Object.keys(source).sort()).toEqual(Object.keys(CV_SOURCE_FILES).sort());
        expect(source.personal.fullName).toBeTruthy();
        expect(Array.isArray(source.personal.summary)).toBe(true);
        expect(source.personal.summary.length).toBeGreaterThan(0);
        expect(source.career.Experience.length).toBeGreaterThan(0);
    });

    it('emits the source as a build asset at the path the Lambda reads', () => {
        const emitFile = vi.fn();
        cvSourcePlugin('production').generateBundle.call({ emitFile, error: vi.fn() });

        expect(emitFile).toHaveBeenCalledTimes(1);
        const asset = emitFile.mock.calls[0][0];
        expect(asset.fileName).toBe(CV_SOURCE_PATH);
        expect(JSON.parse(asset.source)).toEqual(buildCvSource('production'));
    });

    it('refuses to build without a data set rather than publishing an empty CV', () => {
        const error = vi.fn(() => {
            throw new Error('stop');
        });
        expect(() => cvSourcePlugin('').generateBundle.call({ emitFile: vi.fn(), error })).toThrow('stop');
    });

    it('only runs for builds, never the dev server', () => {
        expect(cvSourcePlugin('production').apply).toBe('build');
    });
});
