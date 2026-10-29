import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';

// Wayfinder shells out to `php artisan wayfinder:generate --with-form`, so it can
// only run where a PHP binary exists. Hosted CI builders (Vercel and friends)
// have none, so the generated files under resources/js/{actions,routes,wayfinder}
// are committed to Git and the plugin is skipped there.
const canRunWayfinder = (() => {
    if (process.env.VERCEL) {
        return false;
    }

    try {
        execSync('php -v', { stdio: 'ignore' });

        return true;
    } catch {
        console.warn(
            '[wayfinder] php not found - skipping type generation and using the committed files in resources/js/{actions,routes,wayfinder}.',
        );

        return false;
    }
})();

// When Wayfinder cannot run, the build falls back to the committed generated
// files. Catch their absence here so the failure names the real problem instead
// of surfacing as dozens of unresolved `@/actions` / `@/routes` imports.
const wayfinderOutputs = [
    'resources/js/actions',
    'resources/js/routes',
    'resources/js/wayfinder/index.ts',
];

if (!canRunWayfinder) {
    const projectRoot = fileURLToPath(new URL('.', import.meta.url));
    const missing = wayfinderOutputs.filter(
        (output) => !existsSync(resolve(projectRoot, output)),
    );

    if (missing.length > 0) {
        throw new Error(
            [
                'Wayfinder types are missing and php is not available to generate them:',
                ...missing.map((output) => `  - ${output}`),
                '',
                'Run `php artisan wayfinder:generate --with-form` on a machine with PHP,',
                'then commit the files under resources/js/{actions,routes,wayfinder}.',
            ].join('\n'),
        );
    }
}

export default defineConfig({
    plugins: lazyPlugins(() => [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
        ...(canRunWayfinder
            ? [
                  wayfinder({
                      formVariants: true,
                  }),
              ]
            : []),
    ]),
    server: {
        watch: {
            ignored: [
                '**/.agents/**',
                '**/.claude/**',
                '**/.cursor/**',
                '**/.junie/**',
                '**/vendor/**',
            ],
        },
    },
    lint: {
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/*',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.github/**',
            'composer.json',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            stylesheet: 'resources/css/app.css',
        },
    },
});
