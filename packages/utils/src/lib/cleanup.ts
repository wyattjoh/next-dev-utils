import ora, { type Ora } from "ora";
import * as minio from "minio";

import { getConfig } from "./config/config.js";

export type CleanupOptions = {
	verbose?: boolean;
	dryRun?: boolean;
};

export async function cleanup(options: CleanupOptions = {}) {
	const ENDPOINT = await getConfig("endpoint");
	const BUCKET = await getConfig("bucket");
	const ACCESS_KEY = await getConfig("access_key");
	const SECRET_KEY = await getConfig("secret_key");

	const client = new minio.Client({
		endPoint: ENDPOINT,
		accessKey: ACCESS_KEY,
		secretKey: SECRET_KEY,
	});

	const bucketExists = await client.bucketExists(BUCKET);
	if (!bucketExists) {
		throw new Error(`Bucket "${BUCKET}" does not exist`);
	}

	let spinner: Ora | undefined;
	if (!options.verbose) {
		spinner = ora("Listing objects in bucket...").start();
	}

	const objectsToDelete: string[] = [];
	const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

	try {
		const stream = client.listObjectsV2(BUCKET, "", true);

		await new Promise<void>((resolve, reject) => {
			stream.on("data", (obj) => {
				if (obj.lastModified && obj.lastModified < oneDayAgo) {
					objectsToDelete.push(obj.name);
					if (options.verbose) {
						console.log(`Found old object: ${obj.name} (modified: ${obj.lastModified.toISOString()})`);
					}
				}
			});

			stream.on("error", reject);
			stream.on("end", resolve);
		});

		if (spinner) {
			spinner.succeed(`Found ${objectsToDelete.length} objects older than 1 day`);
		} else if (!options.verbose) {
			console.log(`Found ${objectsToDelete.length} objects older than 1 day`);
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
			spinner = ora(`Deleting ${objectsToDelete.length} old objects...`).start();
		}

		let deletedCount = 0;
		const errors: Array<{ object: string; error: unknown }> = [];

		for (const objectName of objectsToDelete) {
			try {
				await client.removeObject(BUCKET, objectName);
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
				spinner.warn(`Deleted ${deletedCount} objects, ${errors.length} failed`);
			} else {
				spinner.succeed(`Successfully deleted ${deletedCount} objects`);
			}
		} else if (!options.verbose) {
			if (errors.length > 0) {
				console.log(`Deleted ${deletedCount} objects, ${errors.length} failed`);
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