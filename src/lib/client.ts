import find from "find-cache-dir";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

type FetchClientCacheEntry = {
  contents: string;
  expires: number;
};

class FetchClient {
  private dir: string;
  private cache: Map<string, FetchClientCacheEntry>;

  constructor() {
    this.dir = find({ name: "next-dev-utils" })!;
    this.cache = new Map();
  }

  async fetch(url: string): Promise<string> {
    const entry = this.cache.get(url);
    if (entry) {
      return entry.contents;
    }

    const filename = path.join(this.dir, path.basename(url));
    if (existsSync(filename)) {
      const file = await fs.readFile(filename, "utf8");
      const { contents, expires } = JSON.parse(file);

      if (Date.now() < expires) {
        this.cache.set(url, { contents, expires });
        return contents;
      }
    }

    const res = await fetch(url);
    const contents = await res.text();

    const expires = Date.now() + 1000 * 60 * 60;

    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(filename, JSON.stringify({ contents, expires }), "utf8");
    this.cache.set(url, { contents, expires });

    return contents;
  }
}

export const client = new FetchClient();
