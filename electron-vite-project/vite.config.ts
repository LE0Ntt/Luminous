import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // clean Electron output on each run
  rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const isWeb = mode === 'web';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      !isWeb &&
        electron({
          main: {
            entry: 'electron/main/index.ts',
            onstart(args) {
              if (process.env.VSCODE_DEBUG) {
                console.log('[startup] Electron App');
              } else {
                args.startup();
              }
            },
            vite: {
              build: {
                sourcemap,
                minify: isBuild,
                outDir: 'dist-electron/main',
                rollupOptions: {
                  external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
                },
              },
            },
          },
          preload: {
            input: 'electron/preload/index.ts',
            vite: {
              build: {
                sourcemap: sourcemap ? 'inline' : undefined,
                minify: isBuild,
                outDir: 'dist-electron/preload',
                rollupOptions: {
                  external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
                },
              },
            },
          },
          renderer: {},
        }),
    ].filter(Boolean),
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    build: isWeb
      ? {
          outDir: path.resolve(__dirname, '..', 'backend', 'static'),
          emptyOutDir: true,
        }
      : undefined,
    clearScreen: false,
  };
});
