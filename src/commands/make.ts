import path from "node:path";

import { getConfig } from "../lib/config/config.js";
import * as pnpm from "../lib/pnpm.js";

type Commands = "clean" | "install" | "types" | "build" | "dev" | "default";

type Options = {
  command: Commands;
  clean: boolean;
  filter?: string[];
};

const dependencies: Record<Commands, Array<Commands>> = {
  clean: [],
  install: [],
  build: [],
  dev: [],
  types: [],
  default: ["clean", "install", "build", "dev"],
};

type Service = pnpm.PNPMCommand<{
  filter?: string[];
}>;

const service = {
  project: async (args, options) => {
    const nextProjectPath = await getConfig("next_project_path");

    if (options?.filter) {
      args.unshift("--filter", ...options.filter);
    }

    return pnpm.verbose(args, {
      ...options,
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextProjectPath,
    });
  },
  next: async (args, options) => {
    const nextProjectPath = await getConfig("next_project_path");
    const nextPackagePath = path.join(nextProjectPath, "packages/next");

    if (options?.filter) {
      args.unshift("--filter", ...options.filter);
    }

    return pnpm.verbose(args, {
      ...options,
      stdout: "inherit",
      stderr: "inherit",
      cwd: nextPackagePath,
    });
  },
} satisfies Record<string, Service>;

type Command = (options: Options) => Promise<void>;

const commands: Record<Commands, Command | null> = {
  types: async () => {},
  clean: async (options) => {
    // Only run clean if the clean option is set or the command is clean.
    if (!options.clean && options.command !== "clean") return;

    await service.project(["clean"], options);
  },
  install: async (options) => {
    await service.project(["install"], options);
  },
  build: async (options) => {
    await service.project(["build"], options);
  },
  dev: async (options) => {
    await service.next(["dev"], options);
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

export async function makeCommand(options: Options) {
  await run(options.command, options);
}
