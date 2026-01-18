import path from "node:path";
import { existsSync } from "node:fs";
import process from "node:process";

import { getConfig } from "../lib/config/config.ts";
import { getNextProjectPath } from "../lib/get-next-project-path.ts";
import { packNext } from "../lib/pack-next.ts";
import { pnpm } from "../lib/commands/pnpm.ts";
import logger from "../lib/logger.ts";

type Options = {
  "test-file": string[];
};

export async function testDeployCommand(options: Options) {
  const nextProjectPath = await getNextProjectPath();
  const testFiles = options["test-file"];

  const e2eDir = path.join(nextProjectPath, "test", "e2e");
  const validatedTestFiles: string[] = [];

  // Validate each test file
  for (const testFileInput of testFiles) {
    let testFile = testFileInput;
    // Ensure the file exists relative to the current working directory.
    if (!path.isAbsolute(testFile)) {
      testFile = path.join(process.cwd(), testFile);
    }

    if (!existsSync(testFile)) {
      throw new Error(
        `The test file ${testFileInput} does not exist. Please specify a valid test file.`,
      );
    }

    // Ensure that the file is in the test/e2e directory.
    if (!testFile.startsWith(e2eDir + path.sep)) {
      logger.info(e2eDir);
      throw new Error(
        `The test file ${testFileInput} is not in a test/e2e directory. This can only be used with e2e tests.`,
      );
    }

    // Ensure that the file matches the pattern `*.test.{js,ts}`.
    if (!/\.test\.(js|ts)$/.test(testFile)) {
      throw new Error(
        `The test file ${testFileInput} does not match the pattern *.test.{js,ts}. Please specify a valid test file.`,
      );
    }

    validatedTestFiles.push(testFile);
  }

  const VERCEL_TEST_TEAM = await getConfig("vercel_test_team");
  const VERCEL_TEST_TOKEN = await getConfig("vercel_test_token");

  // Pack the next project.
  const url = await packNext({ progress: true });

  // Start the test deploy. If this fails, the error will be printed to the
  // console because it'll throw.
  await pnpm(
    [
      "test-deploy",
      ...validatedTestFiles.map((file) => path.relative(nextProjectPath, file)),
    ],
    {
      cwd: nextProjectPath,
      env: {
        VERCEL_TEST_TEAM,
        VERCEL_TEST_TOKEN,
        NEXT_TEST_VERSION: url,
      },
      stdio: "inherit",
    },
  );
}
