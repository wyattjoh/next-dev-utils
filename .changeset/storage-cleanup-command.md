---
"@next-dev-utils/cli": minor
"@next-dev-utils/utils": minor
---

Add storage cleanup command to remove old packages from cloud storage bucket. The new `cleanup` command automatically removes files older than 1 day, helping maintain storage hygiene by cleaning up temporary test packages and old deployments. Includes `--dry-run` option for safe preview and `--verbose` option for detailed output.