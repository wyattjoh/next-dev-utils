import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import "@std/dotenv/load";

import { configCommand } from "./commands/config.ts";
import { createReproductionCommand } from "./commands/create-reproduction.ts";
import { debugCommand } from "./commands/debug.ts";
import { packCommand } from "./commands/pack.ts";
import { packNextCommand } from "./commands/pack-next.ts";
import { testDeployCommand } from "./commands/test-deploy.ts";
import { cleanupCommand } from "./commands/cleanup.ts";
import { nextCommand } from "./commands/next.ts";
import { ConfigKey, ConfigKeys } from "./lib/config/config.ts";
import { testAllDeployCommand } from "./commands/test-all-deploy.ts";

import deno from "../deno.json" with { type: "json" };

await new Command()
  .name("next-dev-utils")
  .version(deno.version)
  .description("Next.js development utilities")
  // completions command
  .command("completions", new CompletionsCommand())
  // test-deploy command
  .command("test-deploy <test-file...:string>")
  .description("performs a pack and test deploy of the specified test(s)")
  .action((_, ...testFiles) => {
    return testDeployCommand({
      "test-file": testFiles,
    });
  })
  // test-all-deploy command
  .command("test-all-deploy")
  .description(
    "performs a pack and test deploy of the current branch against all deployment tests",
  )
  .option("--proxy <proxy:string>", "Proxy address to use")
  .option(
    "--vercel-cli-version <vercel-cli-version:string>",
    "Vercel CLI version to use",
    { default: "vercel@latest" },
  )
  .action((options) => {
    return testAllDeployCommand({
      proxy: options.proxy,
      vercelCliVersion: options.vercelCliVersion,
    });
  })
  // pack-next command
  .command("pack-next")
  .description("packs up and uploads the Next.js package to cloud storage")
  .option("--json", "Output as JSON")
  .option("--serve", "Serve the package")
  .option("--install", "Install dependencies")
  .option("--progress", "Show progress")
  .option(
    "--swc-platforms <platforms:string>",
    "Comma-separated list of SWC platforms to include (e.g., darwin-arm64,linux-x64-gnu). SWC binaries are automatically included if present.",
  )
  .option(
    "--dry-run",
    "Show what would be packaged without actually uploading",
  )
  .action((options) => {
    return packNextCommand({
      json: options.json ?? false,
      serve: options.serve ?? false,
      install: options.install ?? false,
      progress: options.progress ?? false,
      swcPlatforms: options.swcPlatforms
        ? options.swcPlatforms.split(",").map((p: string) => p.trim())
        : undefined,
      dryRun: options.dryRun ?? false,
    });
  })
  // pack command
  .command("pack")
  .description("packs up and uploads the current package to cloud storage")
  .option("--json", "Output as JSON")
  .option("--serve", "Serve the package")
  .option("--progress", "Show progress")
  .option("--verbose", "Verbose output")
  .action((options) => {
    return packCommand({
      json: options.json ?? false,
      serve: options.serve ?? false,
      progress: options.progress ?? false,
      verbose: options.verbose ?? false,
    });
  })
  // cleanup command
  .command("cleanup")
  .description("removes files older than 1 day from cloud storage bucket")
  .option("--verbose", "show detailed output")
  .option("--dry-run", "show what would be deleted without actually deleting")
  .action((options) => {
    return cleanupCommand({
      verbose: options.verbose ?? false,
      dryRun: options.dryRun ?? false,
    });
  })
  // config command
  .command("config <operation:string> [key:string] [value:string]")
  .description("manage configuration values (get, set, convert)")
  .option(
    "--1password",
    "Force value to be stored as 1Password reference (requires op:// prefix)",
  )
  .option("--raw", "Show raw stored format (for get operation)")
  .action((options, operation, key, value) => {
    // Validate operation
    if (operation !== "get" && operation !== "set" && operation !== "convert") {
      throw new Error("Operation must be 'get', 'set', or 'convert'");
    }
    // Validate key if provided
    if (key && !ConfigKeys.includes(key)) {
      throw new Error(`Invalid key. Must be one of: ${ConfigKeys.join(", ")}`);
    }
    return configCommand({
      operation: operation as "get" | "set" | "convert",
      key: key as ConfigKey,
      value,
      onePassword: options["1password"],
      raw: options.raw,
    });
  })
  // create-reproduction command
  .command("create-reproduction <name:string>")
  .description("creates a bare-bones reproduction project")
  .action((_, name) => {
    return createReproductionCommand({
      name,
    });
  })
  // next command
  .command("next <command:string> [next-project-directory:string]")
  .description("run commands using the development Next.js binary")
  .action((_, command, nextProjectDirectory) => {
    return nextCommand({
      command,
      nextProjectDirectory: nextProjectDirectory ?? Deno.cwd(),
    });
  })
  // debug command
  .command("debug <mode:string> <next-project-directory:string>")
  .description("debug a project with next")
  .option("--rm", "Remove existing build artifacts")
  .option(
    "--run <script:string>",
    "run a script/program while the server is running, signals will be sent to the child process",
  )
  .action((options, mode, nextProjectDirectory, ...args) => {
    // Validate mode
    const validModes = [
      "dev",
      "prod",
      "build",
      "start",
      "standalone",
      "export",
    ] as const;
    if (!validModes.includes(mode as (typeof validModes)[number])) {
      throw new Error(`Invalid mode. Must be one of: ${validModes.join(", ")}`);
    }
    return debugCommand({
      mode: mode as (typeof validModes)[number],
      nextProjectDirectory,
      rm: options.rm ?? false,
      run: options.run,
      _: args,
    });
  })
  .parse(Deno.args);
