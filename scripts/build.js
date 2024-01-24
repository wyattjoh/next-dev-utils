import fs from "fs/promises";
import esbuild from "esbuild";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const clean = async () => {
  await fs.rm("./out", { recursive: true, force: true });
  await fs.rm("./dist", { recursive: true, force: true });
};

const context = {
  extension: () =>
    esbuild.context({
      entryPoints: ["./src/extension.ts"],
      bundle: true,
      platform: "node",
      format: "cjs",
      outfile: "./dist/extension.cjs",
      external: ["vscode"],
      sourcemap: true,
      logLevel: "debug",
    }),
  cli: () =>
    esbuild.context({
      entryPoints: ["./src/cli.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: "./dist/cli.js",
      sourcemap: true,
      logLevel: "debug",
      packages: "external",
    }),
  lib: () =>
    esbuild.context({
      entryPoints: ["./src/lib.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: "./dist/lib.js",
      sourcemap: true,
      logLevel: "debug",
      packages: "external",
    }),
};

const build = {
  $: async (ctx, { watch }) => {
    if (!watch) {
      await ctx.rebuild();
      await ctx.dispose();
      return;
    }

    await ctx.watch();
  },
  lib: async ({ watch }) => {
    await build.$(await context.lib(), { watch });
  },
  extension: async ({ watch }) => {
    await build.$(await context.extension(), { watch });
  },
  cli: async ({ watch }) => {
    await build.$(await context.cli(), { watch });
  },
};

yargs(hideBin(process.argv))
  .command("clean", "Clean the dist folder", {}, async (args) => {
    await clean();
  })
  .option("watch", {
    alias: "w",
    type: "boolean",
    description: "Watch for changes",
  })
  .command("extension", "Build the extension", {}, async (argv) => {
    await clean();
    await build.extension(argv);
  })
  .command("cli", "Build the CLI", {}, async (argv) => {
    await clean();
    await build.cli(argv);
  })
  .command("all", "Build everything", {}, async (argv) => {
    await clean();
    await build.extension(argv);
    await build.cli(argv);
    await build.lib(argv);
  })
  .demandCommand()
  .strict()
  .parse();
