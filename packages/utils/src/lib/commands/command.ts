import type { SpawnOptions } from "node:child_process";

// export type CommandOptions<O> = O & Omit<Partial<Options>, "killSignal">;
export type CommandOptions<O extends {} = {}> = O &
  SpawnOptions & {
    verbose?: boolean;
  };

export type Command<O extends {} = {}> = (
  args?: string[],
  options?: CommandOptions<O>
) => Promise<string>;
