// @ts-check

import clipboard from "clipboardy";

import { packNext as packNextLib } from "../lib/pack-next.mjs";

export async function packNext() {
  const url = await packNextLib();
  await clipboard.write(url);
  console.log("\nCopied URL to clipboard 🦄");
}
