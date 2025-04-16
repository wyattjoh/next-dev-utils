import type { SpawnOptions } from "node:child_process";

export type CommandOptions<
  O extends Record<string, unknown> = Record<string, unknown>,
> = O &
  SpawnOptions & {
    verbose?: boolean;
  };

export type Command<
  O extends Record<string, unknown> = Record<string, unknown>,
> = (args?: string[], options?: CommandOptions<O>) => Promise<string>;
