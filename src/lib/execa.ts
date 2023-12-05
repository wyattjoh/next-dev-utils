import { execa, type Options } from "execa";

export type Command = (args: string[], options?: Options) => Promise<string>;

export function createCommand(
  file: string,
  defaultArgs: string[] = [],
  defaultOptions: Options = {},
  verbose = false
): Command {
  return async (args, options = {}) => {
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

    return stdout;
  };
}
