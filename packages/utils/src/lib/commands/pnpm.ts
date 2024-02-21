import { Command } from "./command.js";
import { createCommand } from "./create-command.js";

type PNPMOptions = {};

export type PNPMCommand<E = {}> = Command<PNPMOptions & E>;

export const pnpm = createCommand<PNPMOptions>("pnpm", [], {
  verbose: true,
});
