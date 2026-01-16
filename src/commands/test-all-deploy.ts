import { execa } from "execa";
import ora from "ora";
import process from "node:process";

import { getNextProjectPath } from "../lib/get-next-project-path.ts";
import { packNext as packNextLib } from "../lib/pack-next.ts";
import logger from "../lib/logger.ts";

type Options = {
  proxy?: string | undefined;
  vercelCliVersion: string;
  hashed: boolean;
};

export async function testAllDeployCommand(options: Options) {
  // Get the branch name from the current git branch.
  const nextProjectPath = await getNextProjectPath();
  const branch = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: nextProjectPath,
  });

  // Pack up the Next.js project and get the URL.
  const nextVersion = await packNextLib({
    progress: true,
    nextProjectPath,
    hashed: options.hashed,
  });

  const args: string[] = [
    "workflow",
    "run",
    "test_e2e_deploy_release.yml",
    "--repo",
    "vercel/next.js",
    "--ref",
    branch.stdout.trim(),
    "--field",
    `nextVersion=${nextVersion}`,
    "--field",
    `vercelCliVersion=${options.vercelCliVersion}`,
  ];

  if (options.proxy) {
    args.push(
      "--field",
      `overrideProxyAddress=${options.proxy}`,
    );
  }

  const spinner = ora("Dispatching test deploy...").start();
  try {
    await execa("gh", args, { cwd: nextProjectPath });

    spinner.succeed("Test deploy dispatched!");
  } catch (err) {
    logger.error(String(err));
    spinner.fail("Failed to dispatch test deploy");
    process.exit(1);
  } finally {
    spinner.stop();
  }
}
