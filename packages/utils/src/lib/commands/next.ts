import path from "node:path";

import { getConfig } from "../config/config.js";
import type { Command } from "./command.js";
import { node } from "./node.js";

type NextOptions = {
  nodeOptions?: string[];
};

export const next: Command<NextOptions> = async (
  args = [],
  { nodeOptions = [], env, ...options } = {}
) => {
  const nextProjectPath = await getConfig("next_project_path");
  const nextExecPath = path.join(
    nextProjectPath,
    "packages/next/dist/bin/next"
  );

  return node([nextExecPath, ...args], {
    ...options,
    env,
    nodeOptions: [
      "--trace-deprecation",
      "--enable-source-maps",
      ...nodeOptions,
    ],
  });
};
