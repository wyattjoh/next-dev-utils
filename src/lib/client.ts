import find from "find-cache-dir";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

type FetchClientCacheEntry = {
  contents: string;
  expires: number;
};

interface FetchClient {
  fetch(url: string): Promise<string>;
}

class BaseFetchClient implements FetchClient {
  async fetch(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    return await res.text();
  }
}

class CachedFetchClient implements FetchClient {
  private readonly client = new BaseFetchClient();
  private readonly dir: string;
  private readonly cache: Map<string, FetchClientCacheEntry>;

  constructor() {
    const dir = find({ name: "next-dev-utils" });
    if (!dir) {
      throw new Error("Could not find cache directory");
    }

    this.dir = dir;
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

      if (
        // If forced, ignore the expiration date on the cache entry. This won't
        // extend the expiry date, but it will allow use of stale cache entries.
        process.env.NEXT_DEV_UTILS_FORCE_CACHE === "true" ||
        Date.now() < expires
      ) {
        this.cache.set(url, { contents, expires });
        return contents;
      }
    } else if (process.env.NEXT_DEV_UTILS_FORCE_CACHE === "true") {
      throw new Error("Force cache enabled but cache entry wasn't found");
    }

    const contents = await this.client.fetch(url);

    const expires = Date.now() + 1000 * 60 * 60;

    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(
      filename,
      JSON.stringify({ contents, expires }),
      "utf8",
    );
    this.cache.set(url, { contents, expires });

    return contents;
  }
}

/**
 * HTTP fetch client with caching support.
 *
 * Automatically caches responses for 1 hour to reduce network requests.
 * Cache behavior can be controlled via environment variables:
 * - `NEXT_DEV_UTILS_SKIP_CACHE`: Skip cache and always fetch fresh data
 * - `NEXT_DEV_UTILS_FORCE_CACHE`: Use cached data even if expired
 *
 * @example
 * ```ts
 * // Fetch with automatic caching
 * const content = await client.fetch('https://api.example.com/data');
 *
 * // Skip cache for this session
 * process.env.NEXT_DEV_UTILS_SKIP_CACHE = 'true';
 * const freshContent = await client.fetch('https://api.example.com/data');
 * ```
 */
export const client =
  // If skip has been enabled and it isn't being forced, then use the base fetch
  // client. This will bypass the cache and fetch the latest data.
  process.env.NEXT_DEV_UTILS_SKIP_CACHE &&
    process.env.NEXT_DEV_UTILS_FORCE_CACHE !== "true"
    ? new BaseFetchClient()
    : new CachedFetchClient();
