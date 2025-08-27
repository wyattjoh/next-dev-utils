import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import os from "node:os";
import http from "node:http";

import ora from "ora";
import { S3Client } from "@bradenmacdonald/s3-lite-client";
import { Confirm } from "@cliffy/prompt";

import { pnpm } from "./commands/pnpm.ts";
import { getConfig } from "./config/config.ts";

/**
 * Options for the pack operation.
 */
export type PackOptions = {
  /** Working directory for the pack operation. */
  cwd?: string;
  /** Serve the package via local HTTP server instead of uploading to S3. */
  serve?: boolean;
  /** Output result in JSON format. */
  json?: boolean;
  /** Show progress indicators during packing. */
  progress?: boolean;
  /** Enable verbose output. */
  verbose?: boolean;
  /** Abort signal for cancelling the operation. */
  signal?: AbortSignal | undefined;
};

/**
 * Packs a Node.js package and either uploads it to S3 or serves it locally.
 *
 * This function:
 * 1. Creates a tarball of the package using pnpm pack
 * 2. Calculates an MD5 hash of the tarball
 * 3. Either:
 *    - Uploads the tarball to S3 and returns a signed URL, or
 *    - Serves the tarball via a local HTTP server (if serve option is true)
 *
 * @param options - Configuration options for the pack operation.
 * @param options.cwd - Working directory containing the package to pack.
 * @param options.serve - If true, serves the package locally instead of uploading.
 * @param options.json - If true, outputs results in JSON format.
 * @param options.progress - If true, shows progress indicators.
 * @param options.verbose - If true, enables verbose logging.
 * @param options.signal - Abort signal for cancelling long-running operations.
 *
 * @returns The URL where the packed tarball can be accessed (either S3 or local server).
 *
 * @example
 * ```ts
 * // Pack and upload to S3
 * const url = await pack({ progress: true });
 * console.log(`Package available at: ${url}`);
 *
 * // Serve locally for testing
 * const localUrl = await pack({ serve: true, verbose: true });
 * console.log(`Serving package at: ${localUrl}`);
 * ```
 */
export async function pack(
  { cwd = process.cwd(), ...options }: PackOptions,
): Promise<string> {
  // Create the temporary folder.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "next-dev-utils-"));

  // Get the current package name.
  const pkg = JSON.parse(
    await fs.readFile(path.join(cwd, "package.json"), "utf8"),
  );

  if (pkg.private) {
    throw new Error("Cannot pack a private package");
  }

  let name: string = pkg.name;

  if (name.startsWith("@")) {
    name = name.substring(1);
  }

  // Replace all `/` with `-`.
  name = name.replace(/\//g, "-");

  // Get the version from the package.json.
  const version: string = pkg.version;

  let spinner = options.progress
    ? ora(`Packing ${name}...`).start()
    : undefined;

  let absolutePackedFile: string;
  let packedFile: string;
  try {
    const pack = await pnpm(["pack", "--pack-destination", dir], {
      cwd,
      verbose: options.verbose,
    });

    // Try to find the filename in the output, it should start with a `/` and
    // end with `.tgz`. It should be on it's own line.
    absolutePackedFile = pack
      .split("\n")
      .map((line) => line.trim())
      .find((line) => {
        return line === path.join(dir, `${name}-${version}.tgz`);
      }) ?? "";

    if (!absolutePackedFile || !existsSync(absolutePackedFile)) {
      throw new Error(`Could not find ${absolutePackedFile}`);
    }

    packedFile = path.basename(absolutePackedFile);
  } catch (err) {
    console.error(err);
    if (spinner) spinner.fail(`Packing ${name} failed`);
    process.exit(1);
  }
  if (spinner) spinner.succeed(`Packed ${name}: ${absolutePackedFile}`);

  // Calculate an md5 hash of the packed file.
  if (spinner) {
    spinner = ora("Calculating md5 hash of packed file...").start();
  }

  let md5: string;
  try {
    const hash = crypto.createHash("md5");
    const fileContent = await fs.readFile(absolutePackedFile);
    hash.update(fileContent);
    md5 = hash.digest("hex");
  } catch (err) {
    console.error(err);
    if (spinner) spinner.fail("Calculating md5 hash of packed file failed");
    process.exit(1);
  }
  if (spinner) spinner.succeed(`Calculated md5 hash of packed file: ${md5}`);

  // If the `--serve` flag is provided, serve via a local web server instead of
  // uploading this to storage.
  if (options.serve) {
    // Read the file into memory
    const file = await fs.readFile(absolutePackedFile);

    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(500).end("No URL");
        return;
      }

      const url = new URL(req.url, "http://localhost");
      if (url.pathname !== `/${packedFile}`) {
        res.writeHead(404).end("Not found");
        return;
      }

      if (url.searchParams.get("md5") !== md5) {
        res.writeHead(400).end("Bad request");
        return;
      }

      console.log(`Serving ${packedFile}...`);

      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
      });

      // Write the file to the response.
      res.end(file);
    });

    // If provided, listen for the abort event and close the server.
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        server.close();
      });
    }

    // Start the server, and block forever (the user will terminate this
    // with a SIGINT).
    const port = await new Promise<number>((resolve, reject) => {
      server.listen(0, () => {
        const address = server.address();
        if (address === null) {
          return reject(new Error("Server address is null"));
        }

        if (typeof address === "string") {
          return reject(new Error("Server address is a string"));
        }

        return resolve(address.port);
      });
    });

    const url = `http://127.0.0.1:${port}/${packedFile}?md5=${md5}`;

    if (options.verbose) {
      console.log(`\nURL: ${url}`);
    }

    return url;
  }

  const ENDPOINT = await getConfig("endpoint");
  const BUCKET = await getConfig("bucket");
  const ACCESS_KEY = await getConfig("access_key");
  const SECRET_KEY = await getConfig("secret_key");

  // Upload the packed file to cloud storage.
  const client = new S3Client({
    endPoint: `https://${ENDPOINT}`,
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
    bucket: BUCKET,
    region: "us-east-1", // Default region
  });

  // Test to see if the bucket exists.
  const bucketExists = await client.bucketExists(BUCKET);
  if (!bucketExists) {
    throw new Error(`Bucket "${BUCKET}" does not exist`);
  }

  // Check if the object already exists in the bucket by comparing the file to
  // the md5 hash.
  if (spinner) {
    spinner = ora("Checking if file already exists in bucket...").start();
  }

  let exists: boolean;
  try {
    const metadata = await client.statObject(packedFile);
    const etag = metadata.etag?.replace(/"/g, "");
    exists = etag === md5;

    if (spinner) {
      if (exists) {
        spinner.succeed("File already exists in cloud storage");
      } else {
        spinner.info(
          "File exists in cloud storage but has differing content",
        );
      }
    }
  } catch {
    exists = false;
    if (spinner) spinner.info("File doesn't exist in cloud storage");
  }

  if (!exists) {
    while (true) {
      // Upload the file.
      if (spinner) {
        spinner = ora("Uploading file to bucket...").start();
      }
      try {
        const fileContent = await fs.readFile(absolutePackedFile);
        await client.putObject(packedFile, fileContent);

        if (spinner) spinner.succeed("Uploaded file to bucket");
        break;
      } catch (err) {
        if (spinner) spinner.fail("Uploading file to bucket failed");

        console.error(err);

        const retry = await Confirm.prompt({
          message: "Retry?",
          default: true,
        });

        if (!retry) {
          process.exit(1);
        }
      }
    }
  }

  if (spinner) {
    spinner = ora("Signing URL...").start();
  }

  // Get the URL to the uploaded file.
  const url = await client.getPresignedUrl(
    "GET",
    packedFile,
    { expirySeconds: 60 * 60 * 24 }, // 1 day in seconds
  );

  if (spinner) spinner.succeed(`Signed URL: ${url}`);

  // Return the URL to the uploaded file.
  return url;
}
