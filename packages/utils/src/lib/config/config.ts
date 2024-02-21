import inquirer from "inquirer";

import Conf from "conf";
import { exists } from "./validators/exists.js";

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

export async function getConfig(key: keyof typeof schema, options: any = {}) {
  let value = config.get(key);
  if (value) {
    if (key in validators) {
      try {
        await (validators as any)[key](value);
      } catch (err) {
        console.error((err as Error).message);
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

export async function prompt(key: keyof typeof schema, options = {}) {
  const { input } = await inquirer.prompt({
    type: secrets.includes(key) ? "password" : "input",
    name: "input",
    message: `${key}:`,
    validate: async (value) => {
      if (key in validators) {
        return await (validators as any)[key](value);
      }

      return true;
    },
    ...options,
  });

  return input;
}
