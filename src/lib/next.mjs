// @ts-check

import { createCommand } from "./execa.mjs";

const next = createCommand(
  "node",
  [
    "--trace-deprecation",
    "--enable-source-maps",
    "packages/next/dist/bin/next",
  ],
  {
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
    },
  }
);

export default next;

export const debug = next;
