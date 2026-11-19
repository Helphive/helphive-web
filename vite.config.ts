import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';

// Build identifier sent as X-App-Version: the package version plus the short commit hash when one is known
// (GITHUB_SHA in CI, else git), e.g. "2.0.0+5a891d4".
const buildId = (): string => {
    const { version } = JSON.parse(
        readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
    ) as {
        version: string;
    };
    let sha = process.env.GITHUB_SHA?.slice(0, 7);
    if (!sha) {
        try {
            sha = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
                stdio: ['ignore', 'pipe', 'ignore'],
            })
                .toString()
                .trim();
        } catch {
            sha = undefined;
        }
    }
    return sha && /^[0-9a-f]+$/i.test(sha) ? `${version}+${sha}` : version;
};

export default defineConfig({
    define: { __APP_VERSION__: JSON.stringify(buildId()) },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
