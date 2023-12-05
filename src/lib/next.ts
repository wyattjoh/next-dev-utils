import path from "node:path";
import { getConfig } from "./config/config.js";
import { Command, createCommand } from "./execa.js";

let next: Command;

const command: Command = async (args, options = {}) => {
  const nextProjectPath = await getConfig("next_project_path");

  if (!next) {
    next = createCommand(
      "node",
      [
        "--trace-deprecation",
        "--enable-source-maps",
        path.join(nextProjectPath, "packages/next/dist/bin/next"),
      ],
      {
        env: {
          NEXT_TELEMETRY_DISABLED: "1",
        },
      }
    );
  }

  return next(args, options);
};

export default command;

export const debug = command;
