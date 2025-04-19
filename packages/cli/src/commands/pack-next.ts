import clipboard from "clipboardy";

import { packNext as packNextLib, pnpm } from "@next-dev-utils/utils";

type Options = {
  json: boolean;
  serve: boolean;
  install: boolean;
};

export async function packNextCommand(options: Options) {
  if (options.json && options.serve) {
    throw new Error("Cannot use --json and --serve together");
  }

  if (options.json && options.install) {
    throw new Error("Cannot use --json and --install together");
  }

  let controller: AbortController | undefined;
  if (options.install) {
    controller = new AbortController();
    options.serve = true;
  }

  const url = await packNextLib({
    ...options,
    progress: options.json || options.install,
    signal: controller?.signal,
  });

  if (!options.json && !options.install) {
    await clipboard.write(url);
    console.log("\nCopied URL to clipboard 🦄");
  } else if (options.json) {
    console.log(url);
  } else if (options.install) {
    await pnpm(["add", "--prefer-offline", JSON.stringify(url)]);

    controller?.abort();
  }
}
