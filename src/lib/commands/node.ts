import { Command } from "./command.js";
import { createCommand } from "./create-command.js";

export type NodeOptions = {
  nodeOptions?: string[];
};

const node = createCommand<NodeOptions>(
  "node",
  ({ nodeOptions = [] } = {}) => {
    return nodeOptions;
  },
  {
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
    },
  }
);

export default node;

export const verbose: Command<NodeOptions> = (args, options = {}) =>
  node(args, { ...options, verbose: true });
