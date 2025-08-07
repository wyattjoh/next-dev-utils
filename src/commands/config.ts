import {
  type Config,
  ConfigKeys,
  getConfig,
  prompt,
  setConfig,
} from "../lib/config/config.ts";

type Options = {
  operation: "get" | "set";
  key: keyof Config | undefined;
  value: string | undefined;
};

export async function configCommand(args: Options) {
  if (args.operation === "get") {
    if (!args.key) {
      for (const key of ConfigKeys) {
        const value = await getConfig(key as keyof Config);
        console.log(`${key}: ${value ?? ""}`);
      }
      return;
    }

    const value = await getConfig(args.key);
    console.log(value ?? "");
  } else if (args.value) {
    if (!args.key) {
      throw new Error("key is required when setting a value");
    }

    await setConfig(args.key, args.value);
  } else {
    if (!args.key) {
      throw new Error("key is required when setting a value");
    }

    const input = await prompt(args.key);

    await setConfig(args.key, input);
  }
}
