import clipboard from "clipboardy";

import { pack as packLib } from "@next-dev-utils/utils";

type Options = {
  json: boolean;
  serve: boolean;
};

export async function packCommand(options: Options) {
  if (options.json && options.serve) {
    throw new Error("Cannot use --json and --serve together");
  }

  const url = await packLib({ ...options, progress: options.json });
  await clipboard.write(url);
  if (!options.json) console.log("\nCopied URL to clipboard 🦄");
  if (options.json) console.log(url);
}
