import path from "node:path";
import { promises as fs } from "node:fs";

import ora, { Ora } from "ora";

import { client as fetchClient } from "./client.js";
import { getConfig } from "./config.js";
import { pack } from "./pack.js";

type Options = {
  serve: boolean;
  json: boolean;
};

export async function packNext(
  options: Options = { serve: false, json: false }
) {
  const nextProjectPath = await getConfig("next_project_path");
  const next = path.join(nextProjectPath, "packages", "next");

  // Get the current package.json.
  const pkgFilename = path.join(next, "package.json");
  const local = await fs.readFile(pkgFilename, "utf8");
  const pkg = JSON.parse(local);
  const { version } = pkg;

  let spinner: Ora | undefined;
  if (!options.json)
    spinner = ora("Getting optional dependencies from unpkg...").start();
  try {
    // Get the optional dependencies from the canary version.
    const json = await fetchClient.fetch(
      `https://unpkg.com/next@${version}/package.json`
    );
    const remote = JSON.parse(json);
    if (
      typeof remote !== "object" ||
      remote === null ||
      Array.isArray(remote)
    ) {
      throw new Error("Expected package.json to be an object");
    }
    if (
      !("optionalDependencies" in remote) ||
      typeof remote.optionalDependencies !== "object" ||
      remote.optionalDependencies === null
    ) {
      throw new Error("Expected package.json to have optionalDependencies");
    }
    const optionalDependencies = remote.optionalDependencies;
    pkg.optionalDependencies = {
      ...pkg.optionalDependencies,
      ...optionalDependencies,
    };
    await fs.writeFile(pkgFilename, JSON.stringify(pkg, null, 2), "utf8");

    if (spinner) spinner.succeed("Got optional dependencies from unpkg");
  } catch (err) {
    console.error(err);
    if (spinner) spinner.fail("Getting optional deps from unpkg failed");
    process.exit(1);
  }

  // Pack the package.
  const url = await pack({ ...options, cwd: next });

  if (spinner) spinner = ora("Restoring package.json...").start();
  try {
    await fs.writeFile(pkgFilename, local, "utf8");

    if (spinner) spinner.succeed("Restored package.json");
  } catch (err) {
    console.error(err);
    if (spinner) spinner.fail("Restoring package.json failed");
    process.exit(1);
  }

  // Return the URL to the uploaded file.
  return url;
}
