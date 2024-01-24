import path from "node:path";

import { getConfig } from "../lib/config/config.js";
import * as pnpm from "../lib/commands/pnpm.js";

type Options = {
  command: readonly Commands[];
  clean: boolean;
  filter?: string[];
};

type Commands =
  | "clean"
  | "install"
  | "types"
  | "build"
  | "dev"
  | "native"
  | "default"
  | "all";

const dependencies: Record<Commands, Array<Commands>> = {
  clean: [],
  install: [],
  build: ["clean", "install"],
  dev: [],
  types: [],
  native: ["clean", "install", "build"],
  default: ["clean", "install", "build", "dev"],
  all: ["native", "default"],
};

type Service = pnpm.PNPMCommand<{
  filter?: string[];
}>;

const create =
  (directory?: string): Service =>
  async (args, options) => {
    const nextProjectPath = await getConfig("next_project_path");

    if (options?.filter) {
      args ??= [];
      args.unshift("--filter", ...options.filter);
    }

    return pnpm.verbose(args, {
      ...options,
      stdout: "inherit",
      stderr: "inherit",
      cwd: directory ? path.join(nextProjectPath, directory) : nextProjectPath,
    });
  };

const service = {
  project: create(),
  next: create("packages/next"),
  swc: create("packages/next-swc"),
} satisfies Record<string, Service>;

type Command = (options: Options) => Promise<void>;

const commands: Record<Commands, Command | null> = {
  types: async () => {},
  clean: async (options) => {
    // Only run clean if the clean option is set or the command is clean.
    if (!options.clean && !options.command.includes("clean")) return;

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
  native: async (options) => {
    await service.swc(["build-native-release"], options);
  },
  default: null,
  all: null,
};

/**
 * Gathers the listed commands dependencies in required order of invocation.
 * @param request
 * @returns
 */
const gather = (request: readonly Commands[]): Commands[] => {
  let result: Commands[] = [];

  const helper = (command: Commands) => {
    for (const dep of dependencies[command]) {
      if (!result.includes(dep)) {
        helper(dep);
      }
    }

    // If the command hasn't been added to our result set, add it now if it
    // has am associated command.
    if (!result.includes(command) && commands[command]) {
      result.push(command);
    }
  };

  // initialize the process for all the passed commands
  request.forEach(helper);

  // return list of commands to execute in the correct order
  return result;
};

export async function makeCommand(options: Options) {
  // Let's look at all the commands that were passed in, and if any of them
  // share any dependencies, we'll run them first before running the command.
  const gathered = gather(options.command);

  for (const command of gathered) {
    // Get the handler for the command that was passed in.
    const handler = commands[command];
    if (!handler) continue;

    // Run it.
    await handler(options);
  }
}
