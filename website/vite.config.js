import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { cvSourcePlugin } from './scripts/cv-source.mjs';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        react(),
        cvSourcePlugin(),
        {
            name: 'treat-js-files-as-jsx',
            // Must run before vite:oxc: plugin-react routes .js files through
            // it for Fast Refresh, and it parses them as plain JS (no JSX).
            enforce: 'pre',
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) return null;
                const { transformWithOxc } = await import('vite');
                const { code: out, map } = await transformWithOxc(code, id, {
                    lang: 'jsx',
                    jsx: { runtime: 'automatic' },
                });
                return { code: out, map };
            },
        },
    ],
    optimizeDeps: {
        force: true,
        rolldownOptions: {
            moduleTypes: {
                '.js': 'jsx',
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        css: false,
        // Vitest 5 prints shadow roots by default, which pulls iconify-icon's
        // internal <style> into every snapshot that renders an icon.
        snapshotFormat: {
            printShadowRoot: false,
        },
        coverage: {
            // json-summary is what the CI job reads to build its step summary;
            // text keeps the table in the local/CI log.
            reporter: ['text', 'json-summary'],
        },
    },
});
