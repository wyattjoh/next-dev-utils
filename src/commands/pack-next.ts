import clipboard from "clipboardy";

import { pnpm } from "../lib/commands/pnpm.ts";
import { packNext as packNextLib } from "../lib/pack-next.ts";
import logger from "../lib/logger.ts";

type Options = {
  json: boolean;
  serve: boolean;
  install: boolean;
  progress: boolean;
  swcPlatforms: string[] | undefined;
  dryRun: boolean;
};

export async function packNextCommand(options: Options) {
  if (options.json && options.serve) {
    throw new Error("Cannot use --json and --serve together");
  }

  if (options.json && options.install) {
    throw new Error("Cannot use --json and --install together");
  }

  if (options.dryRun && options.serve) {
    throw new Error("Cannot use --dry-run and --serve together");
  }

  if (options.dryRun && options.install) {
    throw new Error("Cannot use --dry-run and --install together");
  }

  let controller: AbortController | undefined;
  if (options.install) {
    controller = new AbortController();
    options.serve = true;
  }

  const url = await packNextLib({
    ...options,
    progress: options.json || options.install || options.progress,
    signal: controller?.signal,
    swcPlatforms: options.swcPlatforms,
    dryRun: options.dryRun,
  });

  // In dry-run mode, don't do clipboard or install operations
  if (options.dryRun) {
    logger.info("\n[DRY RUN] Complete. No packages were uploaded.");
    return;
  }

  if (!options.json && !options.install) {
    await clipboard.write(url);
    logger.info("\nCopied URL to clipboard");
  } else if (options.json) {
    logger.info(url);
  } else if (options.install) {
    await pnpm(["add", "--prefer-offline", JSON.stringify(url)]);

    controller?.abort();
  }
}
