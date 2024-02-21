import { Writable } from "node:stream";
import child_process, { type SpawnOptions } from "node:child_process";

import { Command, CommandOptions } from "./command.js";
import { getEnvironment } from "../env.js";

export type DefaultArgsFactory<O extends {} = {}> = (
  options?: CommandOptions<O>
) => string[];

export function runCommand(
  file: string,
  args: string[] = [],
  options: CommandOptions = {}
): Promise<string> {
  const verbose = options?.verbose ?? false;
  if (verbose) {
    console.log(`$ ${file} ${args.join(" ")}`);
  }

  // If the verbose option is enabled, the child process will inherit the
  // stdio of the parent process. Otherwise, the child process will not inherit
  // the stdio of the parent process.
  if (verbose) {
    options.stdio = "inherit";
  } else {
    options.stdio = ["inherit", "pipe", "pipe"];
  }

  const child = child_process.spawn(file, args, options);

  // The combined stdout and stderr of the child process.
  const combined: string[] = [];

  // The Writable stream that will receive the combined stdout and stderr of
  // the child process.
  const createWriter = (writer: Writable) =>
    new Writable({
      /**
       *
       * @param {Buffer} chunk
       * @param encoding
       * @param callback
       */
      write(chunk, _encoding, callback) {
        const decoded = chunk.toString("utf-8");
        combined.push(decoded);

        // If the verbose option is enabled, write the chunk to the writer.
        if (verbose) writer.write(chunk);

        callback();
      },
    });

  // Pipe the stdout and stderr of the child process to the parent process and
  // also to the writer stream.
  if (child.stdout) child.stdout.pipe(createWriter(process.stdout));
  if (child.stderr) child.stderr.pipe(createWriter(process.stderr));

  return new Promise<string>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(combined.join(""));
      } else {
        reject(new Error(`Exited with code ${code}`));
      }
    });
  });
}

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
      ...process.env,
      ...getEnvironment(),
      ...(defaultOptions?.env ?? {}),
      ...(options?.env ?? {}),
    };

    return runCommand(file, [...defaultArgs, ...args], {
      ...defaultOptions,
      ...options,
      env,
      shell: process.env.SHELL ? process.env.SHELL : true,
      stdio: "pipe",
    });
  };
}
