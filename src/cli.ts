import { Command } from "@cliffy/command";
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

import deno from "../deno.json" with { type: "json" };

await new Command()
  .name("next-dev-utils")
  .version(deno.version)
  .description("Next.js development utilities")
  // test-deploy command
  .command("test-deploy <test-file:string>")
  .description("performs a pack and test deploy of the specified test")
  .action((_, testFile) => {
    return testDeployCommand({
      "test-file": testFile,
    });
  })
  // pack-next command
  .command("pack-next")
  .description("packs up and uploads the Next.js package to cloud storage")
  .option("--json", "Output as JSON")
  .option("--serve", "Serve the package")
  .option("--install", "Install dependencies")
  .option("--progress", "Show progress")
  .action((options) => {
    return packNextCommand({
      json: options.json ?? false,
      serve: options.serve ?? false,
      install: options.install ?? false,
      progress: options.progress ?? false,
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
  .description("update or get a config value")
  .action((_, operation, key, value) => {
    // Validate operation
    if (operation !== "get" && operation !== "set") {
      throw new Error("Operation must be 'get' or 'set'");
    }
    // Validate key if provided
    if (key && !ConfigKeys.includes(key)) {
      throw new Error(`Invalid key. Must be one of: ${ConfigKeys.join(", ")}`);
    }
    return configCommand({
      operation: operation as "get" | "set",
      key: key as ConfigKey,
      value,
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
    if (!validModes.includes(mode as typeof validModes[number])) {
      throw new Error(`Invalid mode. Must be one of: ${validModes.join(", ")}`);
    }
    return debugCommand({
      mode: mode as typeof validModes[number],
      nextProjectDirectory,
      rm: options.rm ?? false,
      run: options.run,
      _: args,
    });
  })
  .parse(Deno.args);
