import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import ora from "ora";

import * as next from "../lib/commands/next.js";
import * as node from "../lib/commands/node.js";

async function removeDotNextDirectory(nextProjectPath: string) {
  let spinner = ora("Removing existing .next directory").start();
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
};

export async function debugCommand(options: Options) {
  // Remove the existing .next directory from the project directory if it
  // exists.
  const nextProjectPath = options.nextProjectDirectory;
  if (!existsSync(nextProjectPath)) {
    throw new Error(
      `The next project directory ${nextProjectPath} does not exist.`
    );
  }

  if (options.mode !== "start" && options.mode !== "export") {
    await removeDotNextDirectory(nextProjectPath);
  }

  const controller = new AbortController();
  const { signal } = controller;

  process.on("SIGINT", async () => {
    controller.abort();
  });

  // TODO: add any node options for all next commands
  const nodeOptions: string[] = [];

  try {
    if (
      options.mode === "build" ||
      options.mode === "prod" ||
      options.mode === "standalone"
    ) {
      await next.verbose(["build", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (options.mode === "start" || options.mode === "prod") {
      await next.verbose(["start", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
        nodeOptions,
      });
    }

    if (options.mode === "dev") {
      await next.verbose(["dev", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
        nodeOptions,
      });
    }

    if (options.mode === "standalone") {
      // The standalone server is built in the .next/standalone directory.
      const standalone = path.join(
        nextProjectPath,
        ".next",
        "standalone",
        "server.js"
      );

      await node.verbose([standalone], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (options.mode === "export") {
      await next.verbose(["export", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }
  } catch (err) {
    if (!(err as any).isCanceled) {
      throw err;
    }
  }

  if (options.rm) {
    await removeDotNextDirectory(nextProjectPath);
  }
}
