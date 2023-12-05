import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { configCommand } from "./commands/config.js";
import { createReproductionCommand } from "./commands/create-reproduction.js";
import { debugCommand } from "./commands/debug.js";
import { packCommand } from "./commands/pack.js";
import { packNextCommand } from "./commands/pack-next.js";
import { testDeployCommand } from "./commands/test-deploy.js";
import { buildCommand } from "./commands/make.js";

import { schema } from "./lib/config/config.js";

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
    testDeployCommand
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
    packNextCommand
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
    packCommand
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
      value: {
        type: "string",
      },
    },
    configCommand
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
    createReproductionCommand
  )
  .command(
    "make [command]",
    "starts development with Next.js",
    {
      command: {
        choices: ["clean", "install", "build", "dev", "default"] as const,
        default: "default" as const,
      },
      clean: {
        type: "boolean",
        default: false,
        description: "run `pnpm clean` before building",
      },
    },
    buildCommand
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
        description: "the task to run",
      },
      "next-project-directory": {
        type: "string",
        demand: true,
      },
      rm: {
        type: "boolean",
        default: false,
      },
    },
    debugCommand
  )
  .demandCommand(1)
  .parse();
