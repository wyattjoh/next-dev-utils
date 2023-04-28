// @ts-check

import fs from "node:fs/promises";

import inquirer from "inquirer";

// @ts-expect-error
import Conf from "conf";
import { exists } from "./validators/exists.mjs";

export const secrets = ["secret_key", "vercel_test_token"];

export const schema = {
  next_project_path: {
    type: "string",
  },
  endpoint: {
    type: "string",
  },
  bucket: {
    type: "string",
  },
  access_key: {
    type: "string",
  },
  secret_key: {
    type: "string",
  },
  vercel_test_team: {
    type: "string",
  },
  vercel_test_token: {
    type: "string",
  },
};

export const config = new Conf({
  projectName: "next-dev-utils",
  schema,
});

const validators = {
  next_project_path: exists,
};

/**
 *
 * @param {keyof typeof schema} key
 * @param {any} options
 * @returns
 */
export async function getConfig(key, options = {}) {
  let value = config.get(key);
  if (value) {
    if (key in validators) {
      try {
        await validators[key](value);
      } catch (err) {
        console.error(err.message);
      }
    }

    if (value) {
      return value;
    }
  }

  console.log(`${key} is missing from config, please enter it now:`);
  const input = await prompt(key, options);

  config.set(key, input);

  return input;
}

export async function prompt(key, options = {}) {
  const { input } = await inquirer.prompt({
    type: secrets.includes(key) ? "password" : "input",
    name: "input",
    message: `${key}:`,
    validate: async (value) => {
      if (key in validators) {
        return await validators[key](value);
      }

      return true;
    },
    ...options,
  });

  return input;
}
