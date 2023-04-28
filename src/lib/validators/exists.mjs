// @ts-check

import fs from "node:fs/promises";

export async function exists(value) {
  try {
    await fs.access(value);
  } catch {
    throw new Error(`${value} is not a valid path or does not exist`);
  }

  return true;
}
