import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { finished } from 'node:stream/promises';

import { defineConfig } from '@rsbuild/core';
import type { RsbuildPlugin, RsbuildConfig } from '@rsbuild/core';
import type { Compiler, RspackPluginFunction } from '@rspack/core';
import { color } from 'rslog';

import fg from 'fast-glob';
import hasFlag from 'has-flag';
import Mustache from 'mustache';
import { ZipFile } from 'yazl';

// Treat the build as development mode when the `--watch` option is passed to Rsbuild.
const isDev = hasFlag('watch');

// -----------------------------------------------------------------------------
// Rsbuild Plugins
// -----------------------------------------------------------------------------

interface ZipPluginOptions {
  sourceDir: string;
  zipPath: string;
  include: string[];
}

const zipPlugin = (options: ZipPluginOptions): RsbuildPlugin => {
  return {
    name: 'zip-plugin',
    apply: 'build',
    setup(api) {
      api.onAfterBuild(async () => {
        const { rootPath } = api.context;
        const sourceDir = path.resolve(rootPath, options.sourceDir);
        const zipPath = path.resolve(rootPath, options.zipPath);

        api.logger.start(`creating ${options.zipPath}...`);

        const zip = new ZipFile();
        const files = await fg(options.include, {
          absolute: true,
          cwd: sourceDir,
        });

        for (const f of files) {
          const rp = path.relative(sourceDir, f);
          api.logger.log(color.gray(rp));
          zip.addFile(f, rp);
        }
        const ws = createWriteStream(zipPath);
        zip.outputStream.pipe(ws);
        zip.end();
        await finished(ws);

        api.logger.success(`created ${options.zipPath} successfully`);
      });
    },
  };
};

// -----------------------------------------------------------------------------
// Rspack Plugins
// -----------------------------------------------------------------------------

const manifestPlugin: RspackPluginFunction = (compiler: Compiler) => {
  const packageJsonPath = path.resolve(compiler.context, 'package.json');
  const manifestTemplatePath = path.resolve(
    compiler.context,
    'src/manifest.json',
  );
  compiler.hooks.thisCompilation.tap('ManifestPlugin', (compilation) => {
    compilation.fileDependencies.add(packageJsonPath);
    compilation.fileDependencies.add(manifestTemplatePath);
    compilation.hooks.processAssets.tapPromise(
      {
        name: 'ManifestPlugin',
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
      },
      async () => {
        const { version } = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        const template = await readFile(manifestTemplatePath, 'utf8');

        const output = Mustache.render(template, { version, isDev });
        compilation.emitAsset(
          'pkg/manifest.json',
          new compiler.webpack.sources.RawSource(output),
        );
      },
    );
  });
};

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export default defineConfig(async (): Promise<RsbuildConfig> => {
  return {
    // Base options
    root: import.meta.dirname,
    mode: isDev ? 'development' : 'production',
    plugins: isDev
      ? []
      : [
          zipPlugin({
            sourceDir: 'dist/pkg',
            zipPath: 'dist/pkg.zip',
            include: ['**'],
          }),
          zipPlugin({
            sourceDir: '',
            zipPath: 'dist/source.zip',
            include: ['src/**/*', 'assets/**/*', '*.{md,json,ts}', 'LICENSE'],
          }),
        ],
    splitChunks: false,

    // Output options
    output: {
      cleanDistPath: true,
      copy: [
        {
          from: '**/*.{png,json}',
          to: 'pkg',
          context: path.join(import.meta.dirname, 'assets'),
        },
      ],
      distPath: {
        js: 'pkg',
        assets: 'pkg',
      },
      filename: {
        js: '[name].js',
      },
      filenameHash: false,
    },

    // Source options
    source: {
      define: {
        _DEBUG: JSON.stringify(isDev),
      },
      entry: {
        content_scripts: './src/content_scripts',
        background: './src/background',
      },
    },

    // Tools options
    tools: {
      htmlPlugin: false,
      rspack: {
        plugins: [manifestPlugin],
      },
    },
  };
});
