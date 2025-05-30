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

function hasValidator(
  key: keyof typeof schema
): key is keyof typeof validators {
  return key in validators;
}

export async function getConfig(
  key: keyof typeof schema,
  // biome-ignore lint/suspicious/noExplicitAny: inquirer v12 type compatibility
  options: Record<string, any> = {}
) {
  const value = config.get(key);
  if (value) {
    if (key in validators) {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: migration
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

export async function prompt(
  key: keyof typeof schema,
  options: Record<string, unknown> = {}
) {
  const { input } = await inquirer.prompt([
    {
      type: secrets.includes(key) ? "password" : "input",
      name: "input",
      message: `${key}:`,
      validate: async (value: string) => {
        if (hasValidator(key)) {
          return await validators[key](value);
        }

        return true;
      },
      ...options,
    },
  ]);

  return input;
}
