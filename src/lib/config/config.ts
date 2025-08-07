import {
  Input,
  type InputOptions,
  Secret,
  type SecretOptions,
} from "@cliffy/prompt";
import { getItem, setItem } from "@jollytoad/store-deno-fs";
import * as v from "@valibot/valibot";
import { exists } from "./validators/exists.ts";

/**
 * List of configuration keys that should be treated as secrets.
 * These values will be masked when prompted for input.
 */
export const secrets = ["secret_key", "vercel_test_token"];

const ConfigSchema = v.object({
  next_project_path: v.optional(v.string()),
  endpoint: v.optional(v.string()),
  bucket: v.optional(v.string()),
  access_key: v.optional(v.string()),
  secret_key: v.optional(v.string()),
  vercel_test_team: v.optional(v.string()),
  vercel_test_token: v.optional(v.string()),
});

/**
 * Array of all valid configuration keys.
 */
export const ConfigKeys: string[] = Object.keys(
  ConfigSchema.entries,
);

/**
 * Configuration object type with all available settings.
 */
export type Config = v.InferOutput<typeof ConfigSchema>;

/**
 * Union type of all valid configuration keys.
 */
export type ConfigKey = keyof Config;

// For backward compatibility with schema reference
export const schema = ConfigSchema.entries;

const CONFIG_NAMESPACE = ["next-dev-utils", "config"];

class TypedConfig {
  async get<K extends ConfigKey>(key: K): Promise<Config[K] | undefined> {
    const value = await getItem([...CONFIG_NAMESPACE, key]);
    if (value === undefined) return undefined;

    // Since all our schema fields are optional strings, we can directly return the value
    // after basic type checking
    if (typeof value === "string" || value === undefined) {
      return value as Config[K];
    }

    return undefined;
  }

  async set<K extends ConfigKey>(key: K, value: Config[K]): Promise<void> {
    await setItem([...CONFIG_NAMESPACE, key], value);
  }
}

const config = new TypedConfig();

const validators = {
  next_project_path: exists,
};

function hasValidator(
  key: ConfigKey,
): key is keyof typeof validators {
  return key in validators;
}

/**
 * Sets a configuration value.
 *
 * @param key - The configuration key to set.
 * @param value - The value to set for the key.
 *
 * @example
 * ```ts
 * // Set the Next.js project path
 * await setConfig('next_project_path', '/path/to/next.js');
 *
 * // Set S3 bucket configuration
 * await setConfig('bucket', 'my-bucket');
 * ```
 */
export async function setConfig<K extends ConfigKey>(
  key: K,
  value: Config[K],
): Promise<void> {
  await config.set(key, value);
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
  const value = await config.get(key);
  if (value) {
    if (key in validators) {
      try {
        await (
          validators as Record<
            typeof key,
            (value: string) => Promise<boolean>
          >
        )[key](value);
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

  await config.set(key, input);

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
