import path from "node:path";
import crypto from "node:crypto";
import stream from "node:stream/promises";
import fs from "node:fs/promises";
import os from "node:os";

import ora from "ora";
import minio from "minio";
import inquirer from "inquirer";

import { pnpm } from "./pnpm.js";
import { getConfig } from "./config.js";

export async function packNext() {
  let nextProjectPath = await getConfig("next_project_path");
  let ENDPOINT = await getConfig("endpoint");
  let BUCKET = await getConfig("bucket");
  let ACCESS_KEY = await getConfig("access_key");
  let SECRET_KEY = await getConfig("secret_key");

  // Create the temporary folder.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "next-dev-utils-"));

  let spinner = ora("Packing next...").start();
  let absolutePackedFile;
  let packedFile;
  try {
    await pnpm(["pack", "--pack-destination", dir], {
      cwd: path.join(nextProjectPath, "packages", "next"),
    });

    // Find the name of the packed file.
    const files = await fs.readdir(dir);
    packedFile = files.find(
      (file) => file.startsWith("next-") && file.endsWith(".tgz")
    );
    if (!packedFile) {
      throw new Error("Could not find packed file");
    }

    // Make the packed file absolute.
    absolutePackedFile = path.join(dir, packedFile);
  } catch (err) {
    console.error(err);
    spinner.fail("Packing next failed");
    process.exit(1);
  }
  spinner.succeed(`Packed next: ${absolutePackedFile}`);

  // Calculate an md5 hash of the packed file.
  spinner = ora("Calculating md5 hash of packed file...").start();

  let md5;
  try {
    const hash = crypto.createHash("md5");
    const file = await fs.open(absolutePackedFile, "r");

    await stream.pipeline(file.createReadStream(), hash);

    md5 = hash.digest("hex");
  } catch (err) {
    console.error(err);
    spinner.fail("Calculating md5 hash of packed file failed");
    process.exit(1);
  }
  spinner.succeed(`Calculated md5 hash of packed file: ${md5}`);

  // Upload the packed file to cloud storage.
  const client = new minio.Client({
    endPoint: ENDPOINT,
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
  });

  // Test to see if the bucket exists.
  const bucketExists = await client.bucketExists(BUCKET);
  if (!bucketExists) {
    throw new Error(`Bucket "${BUCKET}" does not exist`);
  }

  // Check if the object already exists in the bucket by comparing the file to
  // the md5 hash.
  spinner = ora("Checking if file already exists in bucket...").start();
  let exists;
  try {
    const metadata = await client.statObject(BUCKET, packedFile);
    exists = metadata.etag === md5;
    if (exists) {
      spinner.succeed("File already exists in cloud storage");
    } else {
      spinner.info("File exists in cloud storage but has differing content");
    }
  } catch {
    exists = false;
    spinner.info("File doesn't exist in cloud storage");
  }

  if (!exists) {
    while (true) {
      // Upload the file.
      spinner = ora("Uploading file to bucket...").start();
      try {
        await client.fPutObject(BUCKET, packedFile, absolutePackedFile, {
          md5,
        });

        spinner.succeed("Uploaded file to bucket");
        break;
      } catch (err) {
        spinner.fail("Uploading file to bucket failed");

        console.error(err);

        const answer = await inquirer.prompt({
          type: "confirm",
          name: "retry",
          message: "Retry?",
          default: true,
        });

        if (!answer.retry) {
          process.exit(1);
        }
      }
    }
  }

  // Get the URL to the uploaded file.
  let url = await client.presignedGetObject(
    BUCKET,
    packedFile,
    // 1 day
    60 * 60 * 24 * 1
  );

  console.log(`\nURL: ${url}`);

  // Return the URL to the uploaded file.
  return url;
}
