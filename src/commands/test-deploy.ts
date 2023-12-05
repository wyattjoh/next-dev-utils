import path from "node:path";

import { existsSync } from "node:fs";

import { getConfig } from "../lib/config/config.js";
import { packNext } from "../lib/pack-next.js";
import { pnpm } from "../lib/pnpm.js";

type Options = {
  "test-file": string;
};

export async function testDeployCommand(options: Options) {
  const nextProjectPath = await getConfig("next_project_path");
  let testFile = options["test-file"];
  // Ensure the file exists relative to the current working directory.
  if (!path.isAbsolute(testFile)) {
    testFile = path.join(process.cwd(), testFile);
  }

  if (!existsSync(testFile)) {
    throw new Error(
      `The test file ${options["test-file"]} does not exist. Please specify a valid test file.`
    );
  }

  // Ensure that the file is in the test/e2e directory.
  const e2eDir = path.join(nextProjectPath, "test", "e2e");
  if (!testFile.startsWith(e2eDir + path.sep)) {
    console.log(e2eDir);
    throw new Error(
      `The test file ${options["test-file"]} is not in a test/e2e directory. This can only be used with e2e tests.`
    );
  }

  // Ensure that the file matches the pattern `*.test.{js,ts}`.
  if (!/\.test\.(js|ts)$/.test(testFile)) {
    throw new Error(
      `The test file ${options["test-file"]} does not match the pattern *.test.{js,ts}. Please specify a valid test file.`
    );
  }

  const VERCEL_TEST_TEAM = await getConfig("vercel_test_team");
  const VERCEL_TEST_TOKEN = await getConfig("vercel_test_token");

  // Pack the next project.
  const url = await packNext();

  // Start the test deploy. If this fails, the error will be printed to the
  // console because it'll throw.
  await pnpm(["test-deploy", path.relative(nextProjectPath, testFile)], {
    cwd: nextProjectPath,
    env: {
      VERCEL_TEST_TEAM,
      VERCEL_TEST_TOKEN,
      NEXT_TEST_VERSION: url,
    },
    stdout: "inherit",
    stderr: "inherit",
  });
}
