import { Command } from "./commands/command.js";
import { createCommand } from "./commands/create-command.js";

type PNPMOptions = {};

export type PNPMCommand<E = {}> = Command<PNPMOptions & E>;

export const pnpm = createCommand<PNPMOptions>("pnpm");

// Add a verbose function to the pnpm module.
export const verbose = createCommand<PNPMOptions>("pnpm", [], {
  verbose: true,
});
