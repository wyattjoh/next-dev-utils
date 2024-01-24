import { type Options } from "execa";

export type CommandOptions<O> = O & Options;

export type Command<O> = (
  args?: string[],
  options?: CommandOptions<O>
) => Promise<string>;
