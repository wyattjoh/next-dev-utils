// @ts-check

import { execa } from "execa";

/**
 * Creates a command to execute.
 *
 * @param {string} file the file to execute
 * @param  {string[]} [defaultArgs] the args to merge into the default args
 * @param {import("execa").Options} [defaultOptions] the options to merge into the default options
 * @param {boolean} [verbose] if true will print command
 * @returns
 */
export function createCommand(
  file,
  defaultArgs = [],
  defaultOptions = {},
  verbose = false
) {
  /**
   * @param  {string[]} args
   * @param  {import("execa").Options} [options]
   */
  return async function (args, options = {}) {
    if (verbose) {
      console.log(`$ ${file} ${args.join(" ")}`);
    }

    const { exitCode, stderr, stdout } = await execa(
      file,
      [...defaultArgs, ...args],
      {
        ...defaultOptions,
        ...options,
        env: {
          ...(defaultOptions.env ?? {}),
          ...(options.env ?? {}),
        },
      }
    );

    if (exitCode !== 0) {
      if (!options.stdout && !options.stderr) {
        console.log(stdout);
        console.error(stderr);
      }
      throw new Error(
        `${file} ${args.join(" ")} failed with exit code ${exitCode}`
      );
    }
  };
}
