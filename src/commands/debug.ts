import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import ora from "ora";
import { execa } from "execa";

import { next } from "../lib/commands/next.ts";
import { node } from "../lib/commands/node.ts";
import process from "node:process";
import logger from "../lib/logger.ts";

async function removeDotNextDirectory(nextProjectPath: string) {
  const spinner = ora("Removing existing .next directory").start();
  try {
    await fs.rm(path.join(nextProjectPath, ".next"), {
      recursive: true,
      force: true,
    });
  } catch (err) {
    spinner.fail("Failed to remove existing .next directory");
    throw err;
  }
  spinner.succeed();
}

type Options = {
  mode: "dev" | "build" | "start" | "prod" | "standalone" | "export";
  nextProjectDirectory: string;
  rm: boolean;
  run: string | undefined;

  /**
   * This is a special property that is used to pass through unknown options to
   * the command. It is not used by the command itself, but is used by the CLI
   * to pass through unknown options to the command. We use this to forward the
   * unknown options to the command.
   */
  _: Array<string | number>;
};

export async function debugCommand(options: Options) {
  // Remove the existing .next directory from the project directory if it
  // exists.
  const nextProjectPath = options.nextProjectDirectory;
  if (!existsSync(nextProjectPath)) {
    throw new Error(
      `The next project directory ${nextProjectPath} does not exist.`,
    );
  }

  if (
    options.run &&
    options.mode !== "start" &&
    options.mode !== "prod" &&
    options.mode !== "standalone"
  ) {
    throw new Error(
      "The --run option is only valid with the start, prod, or standalone command",
    );
  }

  if (options.mode !== "start" && options.mode !== "export") {
    await removeDotNextDirectory(nextProjectPath);
  }

  const controller = new AbortController();
  const { signal } = controller;

  process.on("SIGINT", () => {
    controller.abort();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    controller.abort();
    process.exit(0);
  });

  // Collect any of the unknown options and pass them to the command.
  const args: string[] = [];
  for (const arg of options._) {
    if (typeof arg === "string") {
      args.push(arg);
    }
  }

  // TODO: add any node options for all next commands
  const nodeOptions: string[] = [];

  try {
    if (
      options.mode === "build" ||
      options.mode === "prod" ||
      options.mode === "standalone"
    ) {
      await next(["build", nextProjectPath, ...args], {
        stdio: "inherit",
        signal,
      });
    }

    if (
      options.mode === "start" ||
      options.mode === "prod" ||
      options.mode === "standalone" ||
      options.mode === "dev"
    ) {
      // Start the server and set the promise. If this has a `--run` option,
      // we'll start after the server is started.
      let start: Promise<unknown>;
      switch (options.mode) {
        case "start":
        case "prod":
          start = next(["start", nextProjectPath, ...args], {
            stdio: "inherit",
            signal,
            nodeOptions,
          });
          break;
        case "dev":
          start = next(["dev", nextProjectPath, ...args], {
            stdio: "inherit",
            signal,
            nodeOptions,
          });
          break;
        case "standalone":
          // The standalone server is built in the .next/standalone directory.
          start = node(
            [path.join(
              nextProjectPath,
              ".next",
              "standalone",
              "server.js",
            )],
            {
              stdio: "inherit",
              signal,
            },
          );
          break;
      }

      // If there's a run command, we'll start it after the server is started.
      let run: Promise<unknown> | undefined;
      if (options.run) {
        // Wait for 1 second to give the server a chance to start.
        // TODO: make this deterministic
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Start the run command.
        run = execa(options.run, {
          shell: true,
          stdio: "inherit",
          signal,
        });

        // If the run command exits (or finishes), then abort the server.
        run.finally(() => {
          if (controller.signal.aborted) return;

          logger.info(
            "[next-dev-utils] --run finished, stopping server",
          );
          controller.abort();
        });

        // If the server exits (or finishes), then abort the run command.
        start.finally(() => {
          if (controller.signal.aborted) return;

          logger.info(
            "[next-dev-utils] server finished, stopping --run",
          );
          controller.abort();
        });
      }

      // Wait for both the server and the run command to finish.
      await Promise.all([start, run]);
    } else if (options.mode === "export") {
      await next(["export", nextProjectPath, ...args], {
        stdio: "inherit",
        signal,
      });
    }
  } catch (err) {
    if (!(err as { isCanceled: boolean }).isCanceled) {
      throw err;
    }
  }

  if (options.rm) {
    await removeDotNextDirectory(nextProjectPath);
  }
}
