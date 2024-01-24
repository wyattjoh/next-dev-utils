import { execa } from "execa";

import { Command, CommandOptions } from "./command.js";
import { getEnvironment } from "../env.js";

export type DefaultArgsFactory<O> = (options?: CommandOptions<O>) => string[];

export function createCommand<O extends {} = {}>(
  file: string,
  defaultArgs: string[] | DefaultArgsFactory<O> = [],
  defaultOptions?: CommandOptions<O>
): Command<CommandOptions<O>> {
  return async (args = [], options) => {
    if (typeof defaultArgs === "function") {
      defaultArgs = defaultArgs(options);
    }

    const env = {
      // `process.env` is automatically expanded, no need to use here unless
      // we're trying to avoid a conflict.
      ...getEnvironment(),
      ...(defaultOptions?.env ?? {}),
      ...(options?.env ?? {}),
    };

    const { exitCode, stderr, stdout } = await execa(
      file,
      [...defaultArgs, ...args],
      {
        ...defaultOptions,
        ...options,
        env,
        reject: false,
      }
    );

    if (exitCode !== 0) {
      if (!options?.stdout && !options?.stderr) {
        console.log(stdout);
        console.error(stderr);
      }
      process.exit(exitCode);
    }

    return stdout;
  };
}
