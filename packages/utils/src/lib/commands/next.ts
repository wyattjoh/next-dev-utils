import path from "node:path";

import type { Command } from "./command.js";
import { node } from "./node.js";
import { getNextProjectPath } from "../get-next-project-path.js";

type NextOptions = {
  nodeOptions?: string[];
};

export const next: Command<NextOptions> = async (
  args = [],
  { nodeOptions = [], env, ...options } = {}
) => {
  const nextProjectPath = await getNextProjectPath();
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
