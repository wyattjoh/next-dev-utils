# Release Command

Prepare and execute a new release by reviewing changes, bumping version, updating changelog, and publishing.

## Instructions

1. **Review changes since last release**
   - Run `git tag --sort=-version:refname | head -1` to find the latest release tag
   - Run `git log <latest-tag>..HEAD --oneline` to see commits since last release
   - Run `git diff --stat HEAD` to see any uncommitted changes
   - Summarize all changes (features, fixes, breaking changes)

2. **Determine version bump**
   - **Major** (X.0.0): Breaking changes that require user action
   - **Minor** (x.Y.0): New features, backwards compatible
   - **Patch** (x.y.Z): Bug fixes, minor improvements
   - Ask the user to confirm the version bump type if unclear

3. **Update deno.json**
   - Read current version from `deno.json`
   - Bump to new version based on determined type
   - Update the `"version"` field

4. **Update CHANGELOG.md**
   - Add new version section at the top (after the `# next-dev-utils` header)
   - Follow the existing format:
     ```markdown
     ## X.Y.Z

     ### Major Changes (if any)

     - Description of breaking change

     ### Minor Changes (if any)

     - Description of new feature
       - Sub-bullet for details

     ### Patch Changes (if any)

     - commit-hash: Description of fix
     ```
   - Include commit hashes for individual fixes
   - Group related changes together
   - Write clear, user-facing descriptions

5. **Show summary and ask for confirmation**
   - Display what files were modified
   - Show the new version number
   - Show a summary of changelog entries
   - Use AskUserQuestion to confirm before proceeding:
     - "Commit and release vX.Y.Z?" with options: "Yes, release it" / "No, I need to make changes"

6. **Execute release (after user confirms)**
   - Stage all changes: `git add -A`
   - Commit: `git commit -m "chore: release vX.Y.Z"`
   - Create tag: `git tag vX.Y.Z`
   - Push with tags: `git push origin main --tags`
   - Confirm success to user

## Release Process

The GitHub Actions workflow (`.github/workflows/publish.yml`) is triggered when a tag is pushed:

1. Runs `deno fmt --check`, `deno lint`, and `deno check`
2. Publishes to JSR via `deno publish`
3. Updates the Homebrew formula at `wyattjoh/homebrew-stable`

## Notes

- ALWAYS ask for user confirmation before committing, tagging, or pushing
- The tag format should be `vX.Y.Z` (e.g., `v2.4.0`)
- Focus on accurate changelog entries that help users understand what changed
- If the user declines, stop and let them make manual adjustments
