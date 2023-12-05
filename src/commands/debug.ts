import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import ora from "ora";

import * as next from "../lib/next.js";
import * as node from "../lib/node.js";

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

  try {
    if (
      options.mode === "build" ||
      options.mode === "prod" ||
      options.mode === "standalone"
    ) {
      await next.debug(["build", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (options.mode === "start" || options.mode === "prod") {
      await next.debug(["start", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (options.mode === "dev") {
      await next.debug(["dev", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (options.mode === "standalone") {
      await node.debug(
        [
          // The standalone server is built in the .next/standalone directory.
          path.join(nextProjectPath, ".next", "standalone", "server.js"),
        ],
        {
          stdout: "inherit",
          stderr: "inherit",
          signal,
        }
      );
    }

    if (options.mode === "export") {
      await next.debug(["export", nextProjectPath], {
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
