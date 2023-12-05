import path from "node:path";

import { getConfig } from "../lib/config/config.js";
import * as pnpm from "../lib/pnpm.js";

type Commands = "clean" | "install" | "build" | "dev" | "default";

type Options = {
  command: Commands;
  clean: boolean;
};

const dependencies: Record<Commands, Array<Commands>> = {
  clean: [],
  install: [],
  build: [],
  dev: [],
  default: ["clean", "install", "build", "dev"],
};

type Command = (options: Options) => Promise<void>;

const commands: Record<Commands, Command | null> = {
  clean: async (options) => {
    // Only run clean if the clean option is set or the command is clean.
    if (!options.clean && options.command !== "clean") return;

    const nextProjectPath = await getConfig("next_project_path");

    await pnpm.verbose(["clean"], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextProjectPath,
    });
  },
  install: async () => {
    const nextProjectPath = await getConfig("next_project_path");

    await pnpm.verbose(["install"], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextProjectPath,
    });
  },
  build: async () => {
    const nextProjectPath = await getConfig("next_project_path");

    await pnpm.verbose(["build"], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextProjectPath,
    });
  },
  dev: async () => {
    const nextProjectPath = await getConfig("next_project_path");
    const nextPackagePath = path.join(nextProjectPath, "packages/next");

    await pnpm.verbose(["dev"], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextPackagePath,
    });
  },
  default: null,
};

async function run(command: Commands, options: Options) {
  // Get the dependencies for the command that was passed in.
  const deps = dependencies[command];

  // Run the dependencies for the command that was passed in.
  for (const dep of deps) {
    await run(dep, options);
  }

  // Get the handler for the command that was passed in.
  const handler = commands[command];
  if (!handler) return;

  // Run it.
  await handler(options);
}

export async function buildCommand(options: Options) {
  await run(options.command, options);
}
