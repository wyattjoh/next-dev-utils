import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/cli.ts"],
  clean: true,
  outDir: "dist",
  format: "esm",
  platform: "node",
  dts: true,
  bundle: true,
  // splitting: true,
  // sourcemap: true,
  // dts: true,
});
