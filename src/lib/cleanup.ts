import ora, { type Ora } from "ora";
import { S3Client } from "@bradenmacdonald/s3-lite-client";

import { getConfig } from "./config/config.ts";

/**
 * Options for the cleanup operation.
 */
export type CleanupOptions = {
  /** Enable verbose output for detailed logging. */
  verbose?: boolean;
  /** Perform a dry run without actually deleting objects. */
  dryRun?: boolean;
};

/**
 * Cleans up old objects from an S3 bucket by deleting objects older than 24 hours.
 *
 * @param options - Configuration options for the cleanup operation.
 * @param options.verbose - When true, outputs detailed information about each object.
 * @param options.dryRun - When true, lists objects that would be deleted without actually deleting them.
 *
 * @example
 * ```ts
 * // Delete old objects with verbose output
 * await cleanup({ verbose: true });
 *
 * // Perform a dry run to see what would be deleted
 * await cleanup({ dryRun: true });
 * ```
 */
export async function cleanup(options: CleanupOptions = {}) {
  const ENDPOINT = await getConfig("endpoint");
  const BUCKET = await getConfig("bucket");
  const ACCESS_KEY = await getConfig("access_key");
  const SECRET_KEY = await getConfig("secret_key");

  const client = new S3Client({
    endPoint: `https://${ENDPOINT}/`,
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
    bucket: BUCKET,
    region: "us-east-1", // Default region
  });

  let spinner: Ora | undefined;
  if (!options.verbose) {
    spinner = ora("Listing objects in bucket...").start();
  }

  const objectsToDelete: string[] = [];
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // List all objects in the bucket
    // listObjects returns an async generator
    for await (const obj of client.listObjects({ prefix: "" })) {
      if (obj.lastModified) {
        const lastModified = new Date(obj.lastModified);
        if (lastModified < oneDayAgo && obj.key) {
          objectsToDelete.push(obj.key);
          if (options.verbose) {
            console.log(
              `Found old object: ${obj.key} (modified: ${lastModified.toISOString()})`,
            );
          }
        }
      }
    }

    if (spinner) {
      spinner.succeed(
        `Found ${objectsToDelete.length} objects older than 1 day`,
      );
    } else if (!options.verbose) {
      console.log(
        `Found ${objectsToDelete.length} objects older than 1 day`,
      );
    }

    if (objectsToDelete.length === 0) {
      if (options.verbose) {
        console.log("No objects to clean up");
      }
      return;
    }

    if (options.dryRun) {
      console.log("\nDry run mode - would delete the following objects:");
      for (const obj of objectsToDelete) {
        console.log(`  - ${obj}`);
      }
      return;
    }

    if (!options.verbose) {
      spinner = ora(
        `Deleting ${objectsToDelete.length} old objects...`,
      ).start();
    }

    let deletedCount = 0;
    const errors: Array<{ object: string; error: unknown }> = [];

    for (const objectName of objectsToDelete) {
      try {
        await client.deleteObject(objectName);
        deletedCount++;
        if (options.verbose) {
          console.log(`Deleted: ${objectName}`);
        }
      } catch (error) {
        errors.push({ object: objectName, error });
        if (options.verbose) {
          console.error(`Failed to delete ${objectName}:`, error);
        }
      }
    }

    if (spinner) {
      if (errors.length > 0) {
        spinner.warn(
          `Deleted ${deletedCount} objects, ${errors.length} failed`,
        );
      } else {
        spinner.succeed(`Successfully deleted ${deletedCount} objects`);
      }
    } else if (!options.verbose) {
      if (errors.length > 0) {
        console.log(
          `Deleted ${deletedCount} objects, ${errors.length} failed`,
        );
      } else {
        console.log(`Successfully deleted ${deletedCount} objects`);
      }
    }

    if (errors.length > 0 && !options.verbose) {
      console.error("\nFailed to delete the following objects:");
      for (const { object, error } of errors) {
        console.error(`  - ${object}: ${error}`);
      }
    }
  } catch (error) {
    if (spinner) {
      spinner.fail("Failed to list or delete objects");
    }
    throw error;
  }
}
