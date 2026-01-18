import path from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { createHash } from "node:crypto";

import ora, { type Ora } from "ora";

import { pack, type PackOptions } from "./pack.ts";
import process from "node:process";
import { getNextProjectPath } from "./get-next-project-path.ts";
import logger from "./logger.ts";

const FETCH_TIMEOUT_MS = 10000;

/**
 * Computes MD5 hash of a file.
 */
async function getFileMd5(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return createHash("md5").update(content).digest("hex");
}

/**
 * SWC platform configurations mapping platform directories to package names.
 */
const SWC_PLATFORMS = [
  { dir: "darwin-arm64", pkg: "@next/swc-darwin-arm64" },
  { dir: "darwin-x64", pkg: "@next/swc-darwin-x64" },
  { dir: "linux-arm64-gnu", pkg: "@next/swc-linux-arm64-gnu" },
  { dir: "linux-arm64-musl", pkg: "@next/swc-linux-arm64-musl" },
  { dir: "linux-x64-gnu", pkg: "@next/swc-linux-x64-gnu" },
  { dir: "linux-x64-musl", pkg: "@next/swc-linux-x64-musl" },
  { dir: "win32-arm64-msvc", pkg: "@next/swc-win32-arm64-msvc" },
  { dir: "win32-x64-msvc", pkg: "@next/swc-win32-x64-msvc" },
] as const;

async function getPackageJSON(version: string) {
  let json: string;
  try {
    const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    // Get the optional dependencies from the canary version.
    const res = await fetch(`https://registry.npmjs.org/next/${version}`, {
      redirect: "follow",
      signal,
    });
    if (!res.ok) throw new Error("Failed to fetch package.json");
    json = await res.text();
  } catch {
    logger.error("Failed, falling back to canary version...");

    // The fetch failed, fallback to the canary version.
    const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    const res = await fetch("https://registry.npmjs.org/next/canary", {
      redirect: "follow",
      signal,
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

/**
 * Options for the `packNext` function.
 */
type PackNextOptions = PackOptions & {
  /**
   * The path to the Next.js project. If not provided, the function will
   * automatically determine the path to the Next.js project.
   */
  nextProjectPath?: string | undefined;

  /**
   * Filter which SWC platforms to include. If not provided, all available
   * platforms will be packaged automatically if binaries are present.
   * Platform names match the directory names (e.g., "darwin-arm64", "linux-x64-gnu").
   */
  swcPlatforms?: string[] | undefined;

  /**
   * If true, performs a dry run that shows what would be packaged without
   * actually uploading anything.
   */
  dryRun?: boolean | undefined;
};

/**
 * Validates that a binary file is readable by attempting to read its first few bytes.
 *
 * @param binaryPath - Path to the binary file.
 * @returns True if the file is readable, false otherwise.
 */
async function validateBinaryReadable(binaryPath: string): Promise<boolean> {
  try {
    const handle = await fs.open(binaryPath, "r");
    try {
      // Read the first 4 bytes to verify the file is accessible
      const buffer = new Uint8Array(4);
      await handle.read(buffer, 0, 4, 0);
      return true;
    } finally {
      await handle.close();
    }
  } catch {
    return false;
  }
}

/**
 * Finds available SWC platform packages that have native binaries.
 *
 * @param nextProjectPath - Path to the Next.js project root.
 * @param platformFilter - Optional list of platforms to include.
 * @returns Array of available platforms with their paths.
 */
async function findAvailableSwcPlatforms(
  nextProjectPath: string,
  platformFilter?: string[],
) {
  const swcNpmDir = path.join(nextProjectPath, "crates", "napi", "npm");
  const nativeBinDir = path.join(
    nextProjectPath,
    "packages",
    "next-swc",
    "native",
  );

  const available: Array<{
    platform: (typeof SWC_PLATFORMS)[number];
    packageDir: string;
    binaryPath: string;
  }> = [];

  // Filter platforms if a filter is provided
  const platformsToCheck = platformFilter
    ? SWC_PLATFORMS.filter((p) =>
      platformFilter.includes(p.dir as typeof platformFilter[number])
    )
    : SWC_PLATFORMS;

  // Warn about unknown platforms in filter
  if (platformFilter) {
    const validDirs: readonly string[] = SWC_PLATFORMS.map((p) => p.dir);
    const unknownPlatforms = platformFilter.filter(
      (p) => !validDirs.includes(p),
    );
    if (unknownPlatforms.length > 0) {
      logger.warn(
        `Unknown SWC platform(s): ${
          unknownPlatforms.join(", ")
        }. Valid platforms: ${validDirs.join(", ")}`,
      );
    }
  }

  for (const platform of platformsToCheck) {
    const packageDir = path.join(swcNpmDir, platform.dir);
    const binaryName = `next-swc.${platform.dir}.node`;
    const binaryPath = path.join(nativeBinDir, binaryName);

    // Check if both the package directory and native binary exist
    if (!existsSync(packageDir)) {
      continue;
    }

    if (!existsSync(binaryPath)) {
      continue;
    }

    // Validate the binary is readable
    const isReadable = await validateBinaryReadable(binaryPath);
    if (!isReadable) {
      logger.warn(
        `Binary exists but is not readable: ${binaryPath}. Skipping ${platform.pkg}.`,
      );
      continue;
    }

    available.push({ platform, packageDir, binaryPath });
  }

  return available;
}

/**
 * Result of packaging a single SWC platform binary.
 */
type SwcPackResult = {
  platform: (typeof SWC_PLATFORMS)[number];
  status: "success" | "failed" | "dry-run";
  url?: string;
  error?: string;
};

/**
 * Result of the packSwcPlatforms function.
 */
type PackSwcPlatformsResult = {
  /** Map of package names to their uploaded URLs. */
  urlMap: Map<string, string>;
  /** Platforms that were successfully packaged. */
  successful: SwcPackResult[];
  /** Platforms that failed to package. */
  failed: SwcPackResult[];
  /** Total number of platforms attempted. */
  totalPlatforms: number;
};

/**
 * Packages SWC platform binaries and uploads them to S3 in parallel.
 *
 * @param options - Pack options.
 * @param nextProjectPath - Path to the Next.js project root.
 * @param version - The version string to use.
 * @param platformFilter - Optional list of platforms to include.
 * @param dryRun - If true, shows what would be packaged without uploading.
 * @returns Result containing URL map and status of each platform.
 */
async function packSwcPlatforms(
  options: PackOptions,
  nextProjectPath: string,
  version: string,
  platformFilter?: string[],
  dryRun?: boolean,
): Promise<PackSwcPlatformsResult> {
  const urlMap = new Map<string, string>();
  const availablePlatforms = await findAvailableSwcPlatforms(
    nextProjectPath,
    platformFilter,
  );

  if (availablePlatforms.length === 0) {
    logger.info("No SWC platform binaries found. Skipping SWC packaging.");
    logger.info(
      "Run 'pnpm swc-build-native' in the Next.js repo to build native binaries.",
    );
    return { urlMap, successful: [], failed: [], totalPlatforms: 0 };
  }

  const totalPlatforms = availablePlatforms.length;

  // Log all binary hashes upfront
  logger.info(`Found ${totalPlatforms} SWC platform(s) to package:`);
  for (const { platform, binaryPath } of availablePlatforms) {
    const binaryMd5 = await getFileMd5(binaryPath);
    logger.info(`  ${platform.pkg}: ${binaryPath}`);
    logger.info(`    MD5: ${binaryMd5}`);
  }

  // Handle dry-run mode
  if (dryRun) {
    logger.info("\n[DRY RUN] Would package the following SWC platforms:");
    for (const { platform, binaryPath } of availablePlatforms) {
      logger.info(`  - ${platform.pkg} (${path.basename(binaryPath)})`);
    }
    const dryRunResults: SwcPackResult[] = availablePlatforms.map(
      ({ platform }) => ({
        platform,
        status: "dry-run" as const,
      }),
    );
    return {
      urlMap,
      successful: dryRunResults,
      failed: [],
      totalPlatforms,
    };
  }

  // Track progress across parallel operations
  let completedCount = 0;
  const completedPlatforms: string[] = [];
  const spinner = options.progress
    ? ora(`Packaging SWC binaries [0/${totalPlatforms}]...`).start()
    : undefined;

  const updateProgress = (
    platformName: string,
    status: "success" | "failed",
  ) => {
    completedCount++;
    completedPlatforms.push(`${platformName} (${status})`);
    if (spinner) {
      const latestCompleted = completedPlatforms.slice(-3).join(", ");
      spinner.text =
        `Packaging SWC binaries [${completedCount}/${totalPlatforms}]: ${latestCompleted}`;
    }
  };

  // Process all platforms in parallel
  const results = await Promise.all(
    availablePlatforms.map(
      async ({ platform, packageDir, binaryPath }): Promise<SwcPackResult> => {
        try {
          // Read the package.json and update the version
          const pkgJsonPath = path.join(packageDir, "package.json");
          const originalPkgJson = await fs.readFile(pkgJsonPath, "utf8");
          const pkgJson = JSON.parse(originalPkgJson);

          // Update version to match the main next package
          pkgJson.version = version;
          await fs.writeFile(
            pkgJsonPath,
            JSON.stringify(pkgJson, null, 2),
            "utf8",
          );

          // Copy the native binary to the package directory
          const binaryName = path.basename(binaryPath);
          const destBinaryPath = path.join(packageDir, binaryName);
          await fs.copyFile(binaryPath, destBinaryPath);

          try {
            // Pack and upload (nonInteractive to avoid prompts in parallel)
            const url = await pack({
              ...options,
              cwd: packageDir,
              nonInteractive: true,
              progress: false, // Disable individual spinners for parallel execution
            });
            updateProgress(platform.dir, "success");
            return { platform, status: "success", url };
          } finally {
            // Restore original package.json and remove copied binary
            await fs.writeFile(pkgJsonPath, originalPkgJson, "utf8");
            if (existsSync(destBinaryPath)) {
              await fs.unlink(destBinaryPath);
            }
          }
        } catch (err) {
          updateProgress(platform.dir, "failed");
          return { platform, status: "failed", error: String(err) };
        }
      },
    ),
  );

  // Aggregate results
  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");

  // Update spinner with final status
  if (spinner) {
    if (failed.length === 0) {
      spinner.succeed(
        `Packaged ${successful.length}/${totalPlatforms} SWC platform(s): ${
          successful.map((r) => r.platform.dir).join(", ")
        }`,
      );
    } else if (successful.length === 0) {
      spinner.fail(`All ${totalPlatforms} SWC platform(s) failed to package`);
    } else {
      spinner.warn(
        `Packaged ${successful.length}/${totalPlatforms} SWC platform(s) (${failed.length} failed: ${
          failed.map((r) => r.platform.dir).join(", ")
        })`,
      );
    }
  }

  // Log failures with details
  for (const result of failed) {
    logger.error(`Failed to package ${result.platform.pkg}: ${result.error}`);
  }

  // Populate URL map from successful results
  for (const result of successful) {
    if (result.url) {
      urlMap.set(result.platform.pkg, result.url);
    }
  }

  return { urlMap, successful, failed, totalPlatforms };
}

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
  options: PackNextOptions = {},
): Promise<string> {
  const nextProjectPath: string = options.nextProjectPath ??
    (await getNextProjectPath());

  logger.info(`Next.js project path: ${nextProjectPath}`);

  const next = path.join(nextProjectPath, "packages", "next");

  // Get the current package.json.
  const pkgFilename = path.join(next, "package.json");
  const local = await fs.readFile(pkgFilename, "utf8");
  const pkg = JSON.parse(local);
  const { version } = pkg;

  // Always attempt to package SWC binaries if they're present
  let swcUrlMap: Map<string, string> = new Map();
  try {
    const swcResult = await packSwcPlatforms(
      options,
      nextProjectPath,
      version,
      options.swcPlatforms,
      options.dryRun,
    );

    swcUrlMap = swcResult.urlMap;

    // Check for failures
    if (swcResult.failed.length > 0) {
      const failedPlatforms = swcResult.failed
        .map((r) => r.platform.dir)
        .join(", ");
      logger.error(
        `\nSWC packaging failed for ${swcResult.failed.length} platform(s): ${failedPlatforms}`,
      );

      if (swcResult.successful.length === 0 && swcResult.totalPlatforms > 0) {
        // All platforms that were found failed to package
        logger.error("All SWC platforms failed to package.");
        process.exit(1);
      } else if (swcResult.successful.length > 0) {
        // Partial failure - warn prominently but continue
        logger.warn(
          `Continuing with ${swcResult.successful.length} successful platform(s). ` +
            `The resulting package will have incomplete platform coverage.`,
        );
      }
    }

    // If --swc-platforms was specified but no platforms were found, that's an error
    if (options.swcPlatforms && swcResult.totalPlatforms === 0) {
      logger.error(
        `\nNo SWC platform binaries found matching: ${
          options.swcPlatforms.join(", ")
        }`,
      );
      logger.error(
        "Run 'pnpm swc-build-native' in the Next.js repo to build native binaries.",
      );
      process.exit(1);
    }
  } catch (err) {
    logger.error(`Failed to package SWC binaries: ${String(err)}`);
    process.exit(1);
  }

  // Handle dry-run mode for main package
  if (options.dryRun) {
    logger.info("\n[DRY RUN] Would package Next.js:");
    logger.info(`  - Package: next@${version}`);
    logger.info(`  - Path: ${next}`);
    if (swcUrlMap.size > 0) {
      logger.info(`  - SWC platforms: ${swcUrlMap.size} would be included`);
    }
    return "[dry-run]";
  }

  let spinner: Ora | undefined = options.progress
    ? ora(`Getting optional dependencies for ${version} from npm...`).start()
    : undefined;
  try {
    const remote = await getPackageJSON(version);

    // If the remote version is different than the local version, we need to use
    // the remote version's package.json.
    if (remote.version !== version) {
      // Make version mismatch more prominent
      if (spinner) {
        spinner.warn(
          `Version mismatch: local=${version}, remote=${remote.version}`,
        );
      }
      logger.warn(
        "Using remote package.json because local version doesn't exist on npm.",
      );
      logger.warn(
        "Local edits to package.json (except optionalDependencies) will be IGNORED.",
      );
      logger.warn(
        "If this is unexpected, ensure your local version matches a published version.",
      );

      // If we have SWC URLs, update them in the remote package.json
      if (swcUrlMap.size > 0 && remote.optionalDependencies) {
        for (const [pkgName, url] of swcUrlMap) {
          remote.optionalDependencies[pkgName] = url;
        }
      }

      await fs.writeFile(pkgFilename, JSON.stringify(remote, null, 2), "utf8");
    } else {
      const optionalDependencies = remote.optionalDependencies;
      pkg.optionalDependencies = {
        ...pkg.optionalDependencies,
        ...optionalDependencies,
      };

      // Override SWC dependencies with our packaged URLs
      if (swcUrlMap.size > 0) {
        for (const [pkgName, url] of swcUrlMap) {
          pkg.optionalDependencies[pkgName] = url;
        }
      }

      await fs.writeFile(pkgFilename, JSON.stringify(pkg, null, 2), "utf8");

      if (spinner) {
        spinner.succeed(`Got optional dependencies from npm for ${version}`);
      }
    }
  } catch (err) {
    logger.error(String(err));
    if (spinner) spinner.fail("Getting optional deps from npm failed");
    process.exit(1);
  }

  // Pack the package.
  const url = await pack({ ...options, cwd: next });

  if (options.progress) {
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
