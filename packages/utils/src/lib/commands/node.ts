import { createCommand } from "./create-command.js";

export type NodeOptions = {
  nodeOptions?: string[];
};

export const node = createCommand<NodeOptions>(
  "node",
  ({ nodeOptions = [] } = {}) => {
    return nodeOptions;
  },
  {
    verbose: true,
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
    },
  }
);
