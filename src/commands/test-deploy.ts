import path from "node:path";

import { getConfig } from "../lib/config.js";
import { packNext } from "../lib/pack-next.js";
import { pnpm } from "../lib/pnpm.js";

type Options = {
  "test-file": string;
};

export async function testDeploy({ "test-file": testFile }: Options) {
  let nextProjectPath = await getConfig("next_project_path");
  let VERCEL_TEST_TEAM = await getConfig("vercel_test_team");
  let VERCEL_TEST_TOKEN = await getConfig("vercel_test_token");

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
