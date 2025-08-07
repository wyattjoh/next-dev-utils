import type { SpawnOptions } from "node:child_process";

export type CommandOptions<
  O extends Record<string, unknown> = Record<string, unknown>,
> = SpawnOptions & {
  verbose?: boolean | undefined;
} & O;

export type Command<
  O extends Record<string, unknown> = Record<string, unknown>,
> = (args?: string[], options?: CommandOptions<O>) => Promise<string>;
