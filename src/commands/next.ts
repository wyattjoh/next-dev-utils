import { existsSync } from "node:fs";
import * as next from "../lib/commands/next.js";

type Options = {
  nextProjectDirectory: string;
  command: string;
};

export async function nextCommand(options: Options) {
  // Remove the existing .next directory from the project directory if it
  // exists.
  const nextProjectPath = options.nextProjectDirectory;
  if (!existsSync(nextProjectPath)) {
    throw new Error(
      `The next project directory ${nextProjectPath} does not exist.`
    );
  }

  await next.verbose([options.command, nextProjectPath], {
    stdio: "inherit",
  });
}
