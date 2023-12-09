import { createCommand } from "./commands/create-command.js";

type PNPMOptions = {};

export const pnpm = createCommand<PNPMOptions>("pnpm");

// Add a verbose function to the pnpm module.
export const verbose = createCommand<PNPMOptions>("pnpm", [], {
  verbose: true,
});
