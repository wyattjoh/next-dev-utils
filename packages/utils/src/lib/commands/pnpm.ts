import type { Command } from "./command.js";
import { createCommand } from "./create-command.js";

type PNPMOptions = Record<string, unknown>;

export type PNPMCommand<E = Record<string, unknown>> = Command<PNPMOptions & E>;

export const pnpm = createCommand<PNPMOptions>("pnpm", [], {
  verbose: true,
});
