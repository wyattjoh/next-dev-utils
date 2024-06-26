import { config as Config, schema, prompt } from "@next-dev-utils/utils/config";

type Options = {
  operation: "get" | "set";
  key?: keyof typeof schema;
  value?: string;
};

export async function configCommand(args: Options) {
  if (args.operation === "get") {
    if (!args.key) {
      for (const key in schema) {
        console.log(`${key}: ${Config.get(key)}`);
      }
      return;
    }

    console.log(Config.get(args.key));
  } else if (args.value) {
    if (!args.key) {
      throw new Error("key is required when setting a value");
    }

    Config.set(args.key, args.value);
  } else {
    if (!args.key) {
      throw new Error("key is required when setting a value");
    }

    const input = await prompt(args.key);

    Config.set(args.key, input);
  }
}
