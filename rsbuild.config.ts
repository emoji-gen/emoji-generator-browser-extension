import fs from "node:fs/promises";
import path from "node:path";

import hasFlag from "has-flag";
import { defineConfig } from "@rsbuild/core";
import type { Compiler } from "@rspack/core";
import Mustache from "mustache";

// Treat the build as development mode when the `--watch` option is passed to Rsbuild.
const isDev = hasFlag("watch");

// -----------------------------------------------------------------------------
// Rspack Plugins
// -----------------------------------------------------------------------------

class ManifestPlugin {
  apply(compiler: Compiler) {
    const packageJsonPath = path.resolve(compiler.context, "package.json");
    compiler.hooks.thisCompilation.tap("ManifestPlugin", (compilation) => {
      compilation.fileDependencies.add(packageJsonPath);
      compilation.hooks.processAssets.tapPromise(
        {
          name: "ManifestPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async () => {
          const { version } = JSON.parse(
            await fs.readFile(packageJsonPath, "utf8"),
          );
          const template = await fs.readFile(
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
  }
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export default defineConfig(async () => {
  return {
    // Base options
    root: import.meta.dirname,
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
        plugins: [new ManifestPlugin()],
      },
    },
  };
});
