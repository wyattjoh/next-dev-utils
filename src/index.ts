#!/usr/bin/env node

import path from "node:path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { config } from "./commands/config.js";

import { createReproduction } from "./commands/create-reproduction.js";
import { debugCommand } from "./commands/debug.js";
import { pack } from "./commands/pack.js";
import { packNext } from "./commands/pack-next.js";
import { testDeploy } from "./commands/test-deploy.js";
import { getConfig, schema } from "./lib/config.js";
import { exists } from "./lib/validators/exists.js";

yargs(hideBin(process.argv))
  .command(
    "test-deploy <test-file>",
    "performs a pack and test deploy of the specified test",
    {
      "no-app-dir": {
        type: "boolean",
        default: false,
      },
      "skip-pack": {
        type: "boolean",
        default: false,
      },
      "test-file": {
        type: "string",
        demand: true,
      },
    },
    async (argv) => {
      const nextProjectPath = await getConfig("next_project_path");
      let testFile = argv["test-file"];
      // Ensure the file exists relative to the current working directory.
      if (!path.isAbsolute(testFile)) {
        testFile = path.join(process.cwd(), testFile);
      }

      try {
        await exists(testFile);
      } catch {
        throw new Error(
          `The test file ${argv["test-file"]} does not exist. Please specify a valid test file.`
        );
      }

      // Ensure that the file is in the test/e2e directory.
      const e2eDir = path.join(nextProjectPath, "test", "e2e");
      if (!testFile.startsWith(e2eDir + path.sep)) {
        console.log(e2eDir);
        throw new Error(
          `The test file ${argv["test-file"]} is not in a test/e2e directory. This can only be used with e2e tests.`
        );
      }

      // Ensure that the file matches the pattern `*.test.{js,ts}`.
      if (!/\.test\.(js|ts)$/.test(testFile)) {
        throw new Error(
          `The test file ${argv["test-file"]} does not match the pattern *.test.{js,ts}. Please specify a valid test file.`
        );
      }

      argv["test-file"] = testFile;

      return testDeploy(argv);
    }
  )
  .command(
    "pack-next",
    "packs up and uploads the Next.js package to cloud storage",
    {
      json: {
        type: "boolean",
        default: false,
      },
      serve: {
        type: "boolean",
        default: false,
      },
    },
    packNext
  )
  .command(
    "pack",
    "packs up and uploads the current package to cloud storage",
    {
      json: {
        type: "boolean",
        default: false,
      },
      serve: {
        type: "boolean",
        default: false,
      },
    },
    pack
  )
  .command(
    "config <operation> [key] [value]",
    "update or get a config value",
    {
      operation: {
        choices: ["get", "set"] as const,
        demand: true,
      },
      key: {
        choices: Object.keys(schema) as Array<keyof typeof schema>,
      },
    },
    config
  )
  .command(
    "create-reproduction <name>",
    "creates a bare-bones reproduction project",
    {
      name: {
        type: "string",
        demand: true,
      },
      "no-app-dir": {
        type: "boolean",
        default: false,
      },
    },
    createReproduction
  )
  .command(
    "debug <mode> <next-project-directory>",
    "debug a project with next",
    {
      mode: {
        choices: [
          "dev",
          "prod",
          "build",
          "start",
          "standalone",
          "export",
        ] as const,
        demand: true,
      },
      "next-project-directory": {
        type: "string",
        demand: true,
      },
      rm: {
        type: "boolean",
      },
    },
    async (argv) => {
      await exists(argv["next-project-directory"]);

      return await debugCommand(argv);
    }
  )
  .parserConfiguration({ "camel-case-expansion": false })
  .demandCommand(1)
  .parse();
