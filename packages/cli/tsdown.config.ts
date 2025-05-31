import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/cli.ts"],
  clean: true,
  outDir: "dist",
  format: "esm",
  platform: "node",
});
