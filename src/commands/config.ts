import {
  type Config,
  ConfigKeys,
  type ConfigValue,
  createOnePasswordReference,
  getConfig,
  getRawConfig,
  isOnePasswordReference,
  isOnePasswordReferenceString,
  prompt,
  setConfig,
} from "../lib/config/config.ts";

type Options = {
  operation: "get" | "set" | "convert";
  key: keyof Config | undefined;
  value: string | undefined;
  onePassword: boolean | undefined;
  raw: boolean | undefined;
};

export async function configCommand(args: Options) {
  if (args.operation === "get") {
    await handleGetOperation(args);
  } else if (args.operation === "set") {
    await handleSetOperation(args);
  } else if (args.operation === "convert") {
    await handleConvertOperation(args);
  }
}

async function handleGetOperation(args: Options) {
  if (!args.key) {
    // List all config values
    for (const key of ConfigKeys) {
      const rawValue = await getRawConfig(key as keyof Config);
      if (args.raw) {
        // Show raw format
        const formatted = rawValue
          ? JSON.stringify(rawValue, null, 2)
          : "(not set)";
        console.log(`${key}: ${formatted}`);
      } else {
        // Show resolved format with type indicator
        const resolvedValue = rawValue
          ? await getConfig(key as keyof Config)
          : undefined;
        const typeIndicator = isOnePasswordReference(rawValue)
          ? " [1Password]"
          : "";
        console.log(`${key}: ${resolvedValue ?? "(not set)"}${typeIndicator}`);
      }
    }
    return;
  }

  // Get specific key
  const rawValue = await getRawConfig(args.key);
  if (args.raw) {
    const formatted = rawValue
      ? JSON.stringify(rawValue, null, 2)
      : "(not set)";
    console.log(formatted);
  } else {
    const resolvedValue = rawValue ? await getConfig(args.key) : undefined;
    const typeIndicator = isOnePasswordReference(rawValue)
      ? " [1Password]"
      : "";
    console.log(`${resolvedValue ?? "(not set)"}${typeIndicator}`);
  }
}

async function handleSetOperation(args: Options) {
  if (!args.key) {
    throw new Error("key is required when setting a value");
  }

  let configValue: ConfigValue;

  if (args.value) {
    // Value provided via command line
    configValue = processConfigValue(args.value, args.onePassword);
  } else {
    // Prompt for value
    const input = await prompt(args.key);
    configValue = processConfigValue(input, args.onePassword);
  }

  await setConfig(args.key, configValue);

  const typeMsg = isOnePasswordReference(configValue)
    ? " as 1Password reference"
    : "";
  console.log(`Set ${args.key}${typeMsg}`);
}

async function handleConvertOperation(args: Options) {
  if (!args.key) {
    throw new Error("key is required when converting to 1Password reference");
  }

  const rawValue = await getRawConfig(args.key);
  if (!rawValue) {
    throw new Error(`No value set for ${args.key}`);
  }

  if (isOnePasswordReference(rawValue)) {
    console.log(`${args.key} is already a 1Password reference`);
    return;
  }

  if (typeof rawValue !== "string") {
    throw new Error(`Cannot convert ${args.key}: not a string value`);
  }

  console.log(`Current value: ${rawValue}`);
  console.log("Enter the 1Password reference (op://vault/item/field):");

  const reference = await prompt(args.key, {
    validate: (value: string) => {
      if (!isOnePasswordReferenceString(value)) {
        return "1Password reference must start with 'op://'";
      }
      return true;
    },
  });

  const onePasswordRef = createOnePasswordReference(reference);
  await setConfig(args.key, onePasswordRef);

  console.log(`Converted ${args.key} to 1Password reference: ${reference}`);
}

function processConfigValue(
  value: string,
  forceOnePassword?: boolean,
): ConfigValue {
  // If --1password flag is set, always create a 1Password reference
  if (forceOnePassword) {
    if (!isOnePasswordReferenceString(value)) {
      throw new Error("When using --1password, value must start with 'op://'");
    }
    return createOnePasswordReference(value);
  }

  // Auto-detect 1Password references
  if (isOnePasswordReferenceString(value)) {
    return createOnePasswordReference(value);
  }

  // Return as regular string
  return value;
}
