---
"@next-dev-utils/cli": minor
---

Remove unused tasks implementation from CLI

- Removed the dynamic task loading system (`tasks.ts`)
- Removed the `run [task]` command from the CLI
- Removed the empty `tasks/` directory
- Updated build configuration to remove task entry points

This simplifies the CLI by removing an unused feature that was set up but never implemented with actual tasks.