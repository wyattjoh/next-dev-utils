import path from "node:path";
import { promises as fs } from "node:fs";

import ora from "ora";

import { pack, type PackOptions } from "./pack.ts";
import process from "node:process";
import { getNextProjectPath } from "./get-next-project-path.ts";
import logger from "./logger.ts";

async function getPackageJSON(version: string) {
  let json: string;
  try {
    const signal = AbortSignal.timeout(10000);
    // Get the optional dependencies from the canary version.
    const res = await fetch(`https://registry.npmjs.org/next/${version}`, {
      redirect: "follow",
      signal,
    });
    if (!res.ok) throw new Error("Failed to fetch package.json");
    json = await res.text();
  } catch {
    logger.error("Failed, falling back to latest version...");

    // The fetch failed, fallback to the latest version.
    const res = await fetch("https://registry.npmjs.org/next/canary", {
      redirect: "follow",
    });
    if (!res.ok) throw new Error("Failed to fetch package.json");
    json = await res.text();
  }

  const remote = JSON.parse(json);
  if (
    typeof remote !== "object" || remote === null || Array.isArray(remote)
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

  return remote;
}

/**
 * Options for the `packNext` function.
 */
type PackNextOptions = PackOptions & {
  /**
   * The path to the Next.js project. If not provided, the function will
   * automatically determine the path to the Next.js project.
   */
  nextProjectPath?: string | undefined;
};

/**
 * Packs the Next.js package with proper optional dependencies and uploads it to S3.
 *
 * This function:
 * 1. Fetches the optional dependencies from the npm registry for the current version
 * 2. Updates the local package.json with these dependencies
 * 3. Packs the Next.js package into a tarball
 * 4. Uploads the tarball to S3
 * 5. Restores the original package.json
 *
 * @param options - Configuration options for the packing operation.
 * @param options.progress - Show progress indicators during packing.
 * @param options.verbose - Enable verbose output.
 * @param options.dryRun - Perform a dry run without uploading.
 * @param options.nextProjectPath - The path to the Next.js project.
 *
 * @returns The URL of the uploaded Next.js package tarball.
 *
 * @example
 * ```ts
 * // Pack Next.js with progress indicators
 * const url = await packNext({ progress: true });
 * console.log(`Next.js package uploaded to: ${url}`);
 *
 * // Dry run to see what would be uploaded
 * await packNext({ dryRun: true, verbose: true });
 * ```
 */
export async function packNext(
  options: PackNextOptions = { hashed: false },
): Promise<string> {
  const nextProjectPath: string = options.nextProjectPath ??
    await getNextProjectPath();
  const next = path.join(nextProjectPath, "packages", "next");

  // Get the current package.json.
  const pkgFilename = path.join(next, "package.json");
  const local = await fs.readFile(pkgFilename, "utf8");
  const pkg = JSON.parse(local);
  const { version } = pkg;

  let spinner = options.progress
    ? ora(
      `Getting optional dependencies for ${version} from npm...`,
    ).start()
    : undefined;
  try {
    const remote = await getPackageJSON(version);

    // If the remote version is different than the local version, we need to use
    // the remote version's package.json.
    if (remote.version !== version) {
      logger.error(
        "Using remote package.json, local version doesn't exist. Local edits to package.json will be ignored.",
      );

      await fs.writeFile(
        pkgFilename,
        JSON.stringify(remote, null, 2),
        "utf8",
      );
    } else {
      const optionalDependencies = remote.optionalDependencies;
      pkg.optionalDependencies = {
        ...pkg.optionalDependencies,
        ...optionalDependencies,
      };

      await fs.writeFile(
        pkgFilename,
        JSON.stringify(pkg, null, 2),
        "utf8",
      );
    }

    if (spinner) {
      spinner.succeed(
        `Got optional dependencies from npm for ${version}`,
      );
    }
  } catch (err) {
    logger.error(String(err));
    if (spinner) spinner.fail("Getting optional deps from npm failed");
    process.exit(1);
  }

  // Pack the package.
  const url = await pack({ ...options, cwd: next });

  if (spinner) {
    spinner = ora("Restoring package.json...").start();
  }
  try {
    await fs.writeFile(pkgFilename, local, "utf8");

    if (spinner) spinner.succeed("Restored package.json");
  } catch (err) {
    logger.error(String(err));
    if (spinner) spinner.fail("Restoring package.json failed");
    process.exit(1);
  }

  // Return the URL to the uploaded file.
  return url;
}
