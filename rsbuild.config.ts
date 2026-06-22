import { createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { finished } from "node:stream/promises";

import { defineConfig } from "@rsbuild/core";
import type { Compiler, RspackPluginFunction } from "@rspack/core";

import fg from "fast-glob";
import hasFlag from "has-flag";
import Mustache from "mustache";
import { ZipFile } from "yazl";

// Treat the build as development mode when the `--watch` option is passed to Rsbuild.
const isDev = hasFlag("watch");

// -----------------------------------------------------------------------------
// Rsbuild Plugins
// -----------------------------------------------------------------------------

const zipPlugin = (): RsbuildPlugin => {
  return {
    name: "zip-plugin",
    apply: "build",
    setup(api) {
      api.onAfterBuild(async () => {
        const { rootPath, distPath } = api.context;

        // pkg
        // --------------------------------------------------------------------
        const pkgPath = path.resolve(distPath, "pkg");
        const pkgZipPath = path.resolve(distPath, "pkg.zip");
        const pkgZipRelativePath = path.relative(rootPath, pkgZipPath);

        api.logger.start(`creating ${pkgZipRelativePath}...`);

        const pkgZip = new ZipFile();
        const pkgFiles = await fg(["**/*"], {
          absolute: true,
          cwd: pkgPath,
        });

        for (const f of pkgFiles) {
          pkgZip.addFile(f, path.relative(pkgPath, f));
        }
        pkgZip.outputStream.pipe(createWriteStream(pkgZipPath));
        pkgZip.end();
        await finished(pkgZip.outputStream);

        api.logger.success(`created ${pkgZipRelativePath} successfully`);

        // source
        // --------------------------------------------------------------------
        const sourceZipPath = path.resolve(distPath, "source.zip");
        const sourceZipRelativePath = path.relative(rootPath, sourceZipPath);

        api.logger.start(`creating ${sourceZipRelativePath}...`);

        const sourceZip = new ZipFile();
        const sourceFiles = await fg(
          ["**/*", "!.git", "!dist", "!node_modules", "!pr"],
          {
            absolute: true,
            cwd: rootPath,
          },
        );

        for (const f of sourceFiles) {
          sourceZip.addFile(f, path.relative(rootPath, f));
        }
        sourceZip.outputStream.pipe(createWriteStream(sourceZipPath));
        sourceZip.end();
        await finished(sourceZip.outputStream);

        api.logger.success(`created ${sourceZipRelativePath} successfully`);
      });
    },
  };
};

// -----------------------------------------------------------------------------
// Rspack Plugins
// -----------------------------------------------------------------------------

const manifestPlugin: RspackPluginFunction = (compiler: Compiler) => {
  const packageJsonPath = path.resolve(compiler.context, "package.json");
  compiler.hooks.thisCompilation.tap("ManifestPlugin", (compilation) => {
    compilation.fileDependencies.add(packageJsonPath);
    compilation.hooks.processAssets.tapPromise(
      {
        name: "ManifestPlugin",
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
      },
      async () => {
        const { version } = JSON.parse(await readFile(packageJsonPath, "utf8"));
        const template = await readFile(
          path.resolve(compiler.context, "src/manifest.json"),
          "utf8",
        );

        const output = Mustache.render(template, { version, isDev });
        compilation.emitAsset(
          "pkg/manifest.json",
          new compiler.webpack.sources.RawSource(output),
        );
      },
    );
  });
};

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export default defineConfig(async () => {
  return {
    // Base options
    root: import.meta.dirname,
    mode: isDev ? "development" : "production",
    plugins: isDev ? [] : [zipPlugin()],
    splitChunks: false,

    // Output options
    output: {
      cleanDistPath: true,
      copy: [
        {
          from: "**/*.{png,json}",
          to: "pkg",
          context: path.join(import.meta.dirname, "assets"),
        },
      ],
      distPath: {
        js: "pkg",
        assets: "pkg",
      },
      filename: "[name][ext]",
      filenameHash: false,
    },

    // Source options
    source: {
      define: {
        _DEBUG: JSON.stringify(isDev),
      },
      entry: {
        content_scripts: "./src/content_scripts",
        background: "./src/background",
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
