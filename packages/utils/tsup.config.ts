import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    lib: "./src/lib.ts",
    config: "./src/lib/config/config.ts",
  },
  clean: true,
  outDir: "dist",
  format: "esm",
  platform: "node",
  dts: true,
  splitting: true,
  sourcemap: true,
});
