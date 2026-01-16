import {
  Confirm,
  Input,
  type InputOptions,
  Secret,
  type SecretOptions,
} from "@cliffy/prompt";
import fs from "node:fs/promises";
import { join } from "node:path";
import * as v from "@valibot/valibot";
import { homedir } from "node:os";
import { execa } from "execa";

import { exists } from "./validators/exists.ts";
import logger from "../logger.ts";

/**
 * 1Password reference object type.
 */
export type OnePasswordReference = {
  type: "1password";
  reference: string;
};

/**
 * Configuration value can be either a string or 1Password reference.
 */
export type ConfigValue = string | OnePasswordReference;

/**
 * List of configuration keys that should be treated as secrets.
 * These values will be masked when prompted for input.
 */
export const secrets = ["secret_key", "vercel_test_token", "access_key"];

const onePasswordReferenceSchema = v.object({
  type: v.literal("1password"),
  reference: v.string(),
});

const configValueSchema = v.union([v.string(), onePasswordReferenceSchema]);

const schema = v.object({
  next_project_path: v.optional(v.string()),
  endpoint: v.optional(v.string()),
  bucket: v.optional(v.string()),
  access_key: v.optional(configValueSchema),
  secret_key: v.optional(configValueSchema),
  vercel_test_team: v.optional(v.string()),
  vercel_test_token: v.optional(configValueSchema),
  vercel_project_path: v.optional(v.string()),
});

/**
 * Array of all valid configuration keys.
 */
export const ConfigKeys: string[] = Object.keys(
  schema.entries,
);

/**
 * Configuration object type with all available settings.
 */
export type Config = v.InferOutput<typeof schema>;

/**
 * Union type of all valid configuration keys.
 */
export type ConfigKey = keyof Config;

const CONFIG_FILE_PATH = join(homedir(), ".next-dev-utils.json");

/**
 * Gets the raw configuration value without resolving 1Password references.
 * Useful for displaying the actual stored format.
 */
export async function getRawConfig<K extends ConfigKey>(
  key: K,
): Promise<Config[K] | undefined> {
  const config = await loadConfig();
  return config[key];
}

/**
 * Type guard to check if a value is a 1Password reference object.
 */
export function isOnePasswordReference(
  value: ConfigValue | undefined,
): value is OnePasswordReference {
  return typeof value === "object" && value !== null && "type" in value &&
    value.type === "1password";
}

/**
 * Creates a 1Password reference object from a reference string.
 */
export function createOnePasswordReference(
  reference: string,
): OnePasswordReference {
  return {
    type: "1password",
    reference,
  };
}

/**
 * Checks if a string looks like a 1Password reference (starts with "op://").
 */
export function isOnePasswordReferenceString(value: string): boolean {
  return value.startsWith("op://");
}

/**
 * Resolves a 1Password secret reference using the `op read` command.
 */
async function resolveOnePasswordSecret(reference: string): Promise<string> {
  try {
    const { stdout } = await execa("op", ["read", reference]);
    return stdout.trim();
  } catch (error) {
    const err = error as Error;
    const exitCode = "exitCode" in err
      ? (err as { exitCode: number }).exitCode
      : "unknown";
    throw new Error(
      `1Password CLI failed (exit code ${exitCode}): ${err.message}`,
    );
  }
}

async function loadConfig(): Promise<Config> {
  try {
    const json = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
    return v.parse(schema, JSON.parse(json));
  } catch (err) {
    if (err instanceof Error && err.message.includes("ENOENT")) {
      return {};
    }

    throw err;
  }
}

async function saveConfig(config: Config): Promise<void> {
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
}

/**
 * Sets a configuration value by key.
 *
 * @param key - The configuration key to set.
 * @param value - The value to set for the key.
 */
export async function setConfig<K extends ConfigKey>(
  key: K,
  value: Config[K],
): Promise<void> {
  const config = await loadConfig();
  config[key] = value;
  await saveConfig(config);
}

const validators = {
  next_project_path: exists,
};

function hasValidator(
  key: ConfigKey,
): key is keyof typeof validators {
  return key in validators;
}

/**
 * Gets a configuration value, prompting for input if not set.
 *
 * If the configuration value doesn't exist, the user will be prompted
 * to enter it. Secret values will be masked during input.
 *
 * @param key - The configuration key to retrieve.
 * @param options - Additional options for the input prompt.
 *
 * @returns The configuration value as a string.
 *
 * @example
 * ```ts
 * // Get Next.js project path (prompts if not set)
 * const projectPath = await getConfig('next_project_path');
 *
 * // Get secret key with custom validation
 * const secretKey = await getConfig('secret_key', {
 *   validate: (value) => value.length >= 32
 * });
 * ```
 */
export async function getConfig<K extends ConfigKey>(
  key: K,
  options: Omit<InputOptions, "message"> | Omit<SecretOptions, "message"> = {},
): Promise<string> {
  const config = await loadConfig();
  let value = config[key];

  // Resolve 1Password reference if needed
  if (isOnePasswordReference(value)) {
    try {
      value = await resolveOnePasswordSecret(value.reference);
    } catch (error) {
      logger.error(
        `Failed to resolve 1Password secret for ${key}: ${
          (error as Error).message
        }`,
      );
      // Fall through to prompt for manual input
      value = undefined;
    }
  }

  if (value && typeof value === "string") {
    if (key in validators) {
      try {
        await (
          validators as Record<
            typeof key,
            (value: string) => Promise<boolean>
          >
        )[key](value);
      } catch (err) {
        logger.error((err as Error).message);
        value = undefined;
      }
    }

    if (value) {
      return value;
    }
  }

  logger.info(`${key} is missing from config, please enter it now:`);

  // For secret keys, ask if user wants to use 1Password
  if (secrets.includes(key)) {
    const use1Password = await Confirm.prompt({
      message: `Do you want to use a 1Password reference for ${key}?`,
      default: false,
    });

    if (use1Password) {
      const reference = await Input.prompt({
        message: `Enter 1Password reference (op://vault/item/field):`,
        validate: (value: string) => {
          if (!isOnePasswordReferenceString(value)) {
            return "1Password reference must start with 'op://'";
          }
          return true;
        },
      });

      const onePasswordRef = createOnePasswordReference(reference);
      // Type assertion is safe here because we know secret keys support ConfigValue type
      await setConfig(key, onePasswordRef as Config[typeof key]);

      // Return the resolved value
      try {
        return await resolveOnePasswordSecret(reference);
      } catch (error) {
        logger.error(
          `Failed to resolve 1Password reference: ${(error as Error).message}`,
        );
        logger.error(
          "You can update this reference later using: config convert " + key,
        );
        return reference; // Return the reference string as fallback
      }
    }
  }

  // Regular prompting for non-1Password values
  const input = await prompt(key, options);
  await setConfig(key, input);
  return input;
}

/**
 * Prompts the user for a configuration value.
 *
 * Automatically uses masked input for secret values and applies
 * validation if configured for the specific key.
 *
 * @param key - The configuration key to prompt for.
 * @param options - Additional options for the input prompt.
 *
 * @returns The user-provided configuration value.
 *
 * @example
 * ```ts
 * // Prompt for a regular configuration value
 * const endpoint = await prompt('endpoint');
 *
 * // Prompt for a secret with custom placeholder
 * const token = await prompt('vercel_test_token', {
 *   placeholder: 'Enter your Vercel token'
 * });
 * ```
 */
export async function prompt<K extends ConfigKey>(
  key: K,
  options: Omit<InputOptions, "message"> | Omit<SecretOptions, "message"> = {},
): Promise<string> {
  const PromptType = secrets.includes(key) ? Secret : Input;

  const input = await PromptType.prompt({
    message: `${key}:`,
    validate: async (value: string) => {
      if (hasValidator(key)) {
        const result = await validators[key](value);
        return result === true ? true : result;
      }
      return true;
    },
    ...options,
  });

  return input;
}
