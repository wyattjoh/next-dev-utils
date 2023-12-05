import path from "node:path";
import crypto from "node:crypto";
import stream from "node:stream/promises";
import { existsSync, promises as fs } from "node:fs";
import os from "node:os";
import http from "node:http";

import ora, { Ora } from "ora";
import * as minio from "minio";
import inquirer from "inquirer";

import { pnpm } from "./pnpm.js";
import { getConfig } from "./config.js";

type Options = {
  cwd?: string;
  serve: boolean;
  json: boolean;
};

export async function pack({ cwd = process.cwd(), ...options }: Options) {
  // Create the temporary folder.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "next-dev-utils-"));

  // Get the current package name.
  const pkg = JSON.parse(
    await fs.readFile(path.join(cwd, "package.json"), "utf8")
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

  let spinner: Ora | undefined;
  if (!options.json) spinner = ora(`Packing ${name}...`).start();

  let absolutePackedFile: string;
  let packedFile: string;
  try {
    const pack = await pnpm(["pack", "--pack-destination", dir], {
      cwd,
    });

    // Try to find the filename in the output, it should start with a `/` and
    // end with `.tgz`. It should be on it's own line.
    absolutePackedFile =
      pack
        .split("\n")
        .map((line) => line.trim())
        .find((line) => {
          return line === path.join(dir, `${name}-${version}.tgz`);
        }) ?? "";

    if (!absolutePackedFile || !existsSync(absolutePackedFile)) {
      throw new Error("Could not find " + absolutePackedFile);
    }

    packedFile = path.basename(absolutePackedFile);
  } catch (err) {
    console.error(err);
    if (spinner) spinner.fail(`Packing ${name} failed`);
    process.exit(1);
  }
  if (spinner) spinner.succeed(`Packed ${name}: ${absolutePackedFile}`);

  // Calculate an md5 hash of the packed file.
  if (spinner) spinner = ora("Calculating md5 hash of packed file...").start();

  let md5: string;
  try {
    const hash = crypto.createHash("md5");
    const file = await fs.open(absolutePackedFile, "r");

    await stream.pipeline(file.createReadStream(), hash);

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

    console.log(`\nURL: ${url}`);

    return url;
  }

  const ENDPOINT = await getConfig("endpoint");
  const BUCKET = await getConfig("bucket");
  const ACCESS_KEY = await getConfig("access_key");
  const SECRET_KEY = await getConfig("secret_key");

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
  if (spinner) {
    spinner = ora("Checking if file already exists in bucket...").start();
  }

  let exists;
  try {
    const metadata = await client.statObject(BUCKET, packedFile);
    exists = metadata.etag === md5;

    if (spinner) {
      if (exists) {
        spinner.succeed("File already exists in cloud storage");
      } else {
        spinner.info("File exists in cloud storage but has differing content");
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
        await client.fPutObject(BUCKET, packedFile, absolutePackedFile, {
          md5,
        });

        if (spinner) spinner.succeed("Uploaded file to bucket");
        break;
      } catch (err) {
        if (spinner) spinner.fail("Uploading file to bucket failed");

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
  const url = await client.presignedGetObject(
    BUCKET,
    packedFile,
    // 1 day
    60 * 60 * 24 * 1
  );

  if (!options.json) console.log(`\nURL: ${url}`);

  // Return the URL to the uploaded file.
  return url;
}
