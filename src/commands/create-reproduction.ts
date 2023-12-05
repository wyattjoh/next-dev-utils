import fs from "node:fs/promises";
import path from "node:path";

import stripIndent from "strip-indent";

import { getConfig } from "../lib/config.js";

type Options = {
  name: string;
};

export async function createReproduction(args: Options) {
  // In the reproductions folder, create a folder with the name of the reproduction
  const reproduction = path.join(
    await getConfig("next_project_path"),
    "__reproductions__",
    args.name
  );

  // Create the folder.
  await fs.mkdir(reproduction, { recursive: true });

  // Create the Next.js config file.
  await fs.writeFile(
    path.join(reproduction, "next.config.js"),
    stripIndent(`
    module.exports = {
        experimental: {},
    };`)
  );

  // Create the app/ folder.
  await fs.mkdir(path.join(reproduction, "app"), { recursive: true });

  console.log("Created reproduction folder", reproduction);
}
