import { execa, type Options } from "execa";

export function createCommand(
  file: string,
  defaultArgs: string[] = [],
  defaultOptions: Options = {},
  verbose = false
) {
  return async function (args: string[], options: Options = {}) {
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
        reject: false,
      }
    );

    if (exitCode !== 0) {
      if (!options.stdout && !options.stderr) {
        console.log(stdout);
        console.error(stderr);
      }
      process.exit(exitCode);
    }
  };
}
