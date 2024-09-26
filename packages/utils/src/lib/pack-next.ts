import path from "node:path";
import { promises as fs } from "node:fs";

import ora, { Ora } from "ora";

import { client as fetchClient } from "./client.js";
import { getConfig } from "./config/config.js";
import { type PackOptions, pack } from "./pack.js";

async function getPackageJSON(version: string) {
  let json;
  try {
    // Get the optional dependencies from the canary version.
    const res = await fetch(`https://unpkg.com/next@${version}/package.json`, {
      redirect: "follow",
    });
    if (!res.ok) throw new Error("Failed to fetch package.json");
    json = await res.text();
  } catch {
    console.log("Failed, falling back to latest version...");

    // The fetch failed, fallback to the latest version.
    const res = await fetch("https://unpkg.com/next@canary/package.json", {
      redirect: "follow",
    });
    if (!res.ok) throw new Error("Failed to fetch package.json");
    json = await res.text();
  }

  const remote = JSON.parse(json);
  if (typeof remote !== "object" || remote === null || Array.isArray(remote)) {
    throw new Error("Expected package.json to be an object");
  }
  if (
    !("optionalDependencies" in remote) ||
    typeof remote.optionalDependencies !== "object" ||
    remote.optionalDependencies === null
  ) {
    throw new Error("Expected package.json to have optionalDependencies");
  }

  return remote;
}

export async function packNext(options: PackOptions = {}) {
  const nextProjectPath = await getConfig("next_project_path");
  const next = path.join(nextProjectPath, "packages", "next");

  // Get the current package.json.
  const pkgFilename = path.join(next, "package.json");
  const local = await fs.readFile(pkgFilename, "utf8");
  const pkg = JSON.parse(local);
  const { version } = pkg;

  let spinner: Ora | undefined;
  if (options.progress) {
    spinner = ora(
      `Getting optional dependencies for ${version} from unpkg...`
    ).start();
  }
  try {
    const remote = await getPackageJSON(version);

    // If the remote version is different than the local version, we need to use
    // the remote version's package.json.
    if (remote.version !== version) {
      console.log(
        "Using remote package.json, local version doesn't exist. Local edits to package.json will be ignored."
      );

      await fs.writeFile(pkgFilename, JSON.stringify(remote, null, 2), "utf8");
    } else {
      const optionalDependencies = remote.optionalDependencies;
      pkg.optionalDependencies = {
        ...pkg.optionalDependencies,
        ...optionalDependencies,
      };

      await fs.writeFile(pkgFilename, JSON.stringify(pkg, null, 2), "utf8");
    }

    if (spinner)
      spinner.succeed(`Got optional dependencies from unpkg for ${version}`);
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
