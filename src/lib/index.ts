/**
 * Core library for Next.js development utilities providing packaging, deployment,
 * and debugging functionality with S3-compatible cloud storage support.
 *
 * This module exports utilities for:
 * - Packaging and uploading projects to S3-compatible storage
 * - Next.js specific packaging with npm registry integration
 * - HTTP client with caching capabilities
 * - Command execution utilities for pnpm, node, and Next.js
 * - Environment helpers and configuration management
 * - Storage cleanup for old packages
 *
 * @example
 * ```ts
 * import { packNext, packProject, cleanupStorage } from "@wyattjoh/next-dev-utils/lib";
 *
 * // Package a Next.js project with dependencies
 * const url = await packNext({
 *   projectPath: "/path/to/next-project",
 *   bucket: "my-bucket",
 *   endpoint: "https://s3.amazonaws.com",
 *   accessKey: "KEY",
 *   secretKey: "SECRET"
 * });
 *
 * // Clean up old packages from storage
 * await cleanupStorage({
 *   bucket: "my-bucket",
 *   prefix: "packages/",
 *   maxAgeHours: 24
 * });
 * ```
 *
 * @module
 */

// Library exports
export * from "./cleanup.ts";
export * from "./client.ts";
export * from "./env.ts";
export * from "./get-next-project-path.ts";
export * from "./pack-next.ts";
export * from "./pack.ts";

// Commands exports
export * from "./commands/next.ts";
export * from "./commands/node.ts";
export * from "./commands/pnpm.ts";
