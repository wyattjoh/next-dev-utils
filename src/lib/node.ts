import { createCommand } from "./execa.js";

const node = createCommand("node", [], {
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

export const debug = node;

export default node;
