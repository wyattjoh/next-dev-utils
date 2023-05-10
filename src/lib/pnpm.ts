import { createCommand } from "./execa.js";

export const pnpm = createCommand("pnpm");

// Add a verbose function to the pnpm module.
export const verbose = createCommand("pnpm", [], {}, true);
