// @ts-check

import fs from "node:fs/promises";
import path from "node:path";
import ora from "ora";
import * as next from "../lib/next.mjs";

async function removeDotNextDirectory(nextProjectPath) {
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

/**
 *
 * @param {{ mode: "dev" | "build" | "start", "next-project-directory": string, rm?: boolean }} argv
 */
export async function debugCommand(argv) {
  // Remove the existing .next directory from the project directory if it
  // exists.
  const nextProjectPath = argv["next-project-directory"];

  if (argv.mode !== "start") {
    await removeDotNextDirectory(nextProjectPath);
  }

  const controller = new AbortController();
  const { signal } = controller;

  process.on("SIGINT", async () => {
    controller.abort();
  });

  try {
    if (argv.mode === "build") {
      await next.debug(["build", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (argv.mode === "start") {
      await next.default(["build", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });

      await next.debug(["start", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }

    if (argv.mode === "dev") {
      await next.debug(["dev", nextProjectPath], {
        stdout: "inherit",
        stderr: "inherit",
        signal,
      });
    }
  } catch (err) {
    if (!err.isCanceled) {
      throw err;
    }
  }

  if (argv.rm) {
    await removeDotNextDirectory(nextProjectPath);
  }
}
